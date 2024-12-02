const express = require('express');
const cors = require('cors');
const OpenAI =require("openai");
const fetch = require('node-fetch');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const ASSISTANT_ID = process.env.ASSISTANT_ID;
const THREAD_ID = process.env.THREAD_ID;

const app = express();
app.use(cors()); // Enable CORS if needed
app.use(express.json()); // Parse JSON bodies

// Define API endpoints
app.get('/api/hello', (req, res) => {
  res.send('Hello from the backend!');
});

// Endpoint to terminate the current run
app.post('/api/terminate-run', async (req, res) => {
  try {
    // List all runs
    const runs = await openai.beta.threads.runs.list(THREAD_ID);

    if (runs.data.length === 0) {
      return res.status(404).json({ error: 'No runs found.' });
    }

    // Get the current run ID (the first one in the list)
    const currentRunId = runs.data[0].id;

    // Terminate the current run
    const terminatedRun = await openai.beta.threads.runs.cancel(THREAD_ID, currentRunId);

    res.json({ message: 'Run terminated successfully.', run: terminatedRun });
  } catch (error) {
    console.error('Error terminating run:', error.message);
    res.status(500).json({ error: 'Failed to terminate the run.' });
  }
});

// Function to handle required actions during FUNCTIONCALLING
const handleRequiresAction = async (run) => {
  if (
    run.required_action &&
    run.required_action.submit_tool_outputs &&
    run.required_action.submit_tool_outputs.tool_calls
  ) {
    const toolOutputs = await Promise.all(
      run.required_action.submit_tool_outputs.tool_calls.map(async (tool) => {
        console.log(tool.function.name+"is being invoked");
        const funcargs=JSON.parse(tool.function.arguments);
        console.log("oracle: "+funcargs.limit+funcargs.breedNames);
        if (tool.function.name === "fetchRandomCatImages") {
          const limit = funcargs.limit ? funcargs.limit : 1;
          const breedNames=funcargs.breedNames ? funcargs.breedNames : "";
          const images = await fetchRandomCatImages(limit, breedNames);
          return {
            tool_call_id: tool.id,
            output: images, // Pass the concatenated string of image URLs
          };
        }
        
      })
    );

    // Submit tool outputs
    if (toolOutputs.length > 0) {
      run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
        THREAD_ID,
        run.id,
        { tool_outputs: toolOutputs },
      );
      console.log("Tool outputs submitted successfully.");
    } else {
      console.log("No tool outputs to submit.");
    }

    // Handle the updated run status
    return handleRunStatus(run);
  }
};

// Function to handle run status
const handleRunStatus = async (run) => {
  if (run.status === "completed") {
    const messages = await openai.beta.threads.messages.list(THREAD_ID);
    return messages.data;
  } else if (run.status === "requires_action") {
    return await handleRequiresAction(run);
  } else {
    console.error("Run did not complete:", run);
  }
};

// Endpoint to process chat and allow FUNCTIONCALLING
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Add user message to the thread
    await openai.beta.threads.messages.create(THREAD_ID, {
      role: 'user',
      content: userMessage,
    });

    // Create and poll a run
    let run = await openai.beta.threads.runs.createAndPoll(THREAD_ID, {
      assistant_id: ASSISTANT_ID,
      instructions: 'You can call fetchRandomCatImages(limit, breedNames) to fetch cat images. Even if there are multiple breeds, try to make only one function call by passing all breeds as a comma separated string as instructed.',
    });

    // Handle run status
    const messages = await handleRunStatus(run);
    const assistantMessage = messages.find((msg) => msg.role === 'assistant');
    res.json({ response: assistantMessage.content });
    console.log(assistantMessage.content);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to process the request.' });
  }
});

const fs = require('fs');
const path = require('path');

// Function to find the breed IDs by names
function findBreedIdsByNames(breedNames) {
  const filePath = path.join(__dirname, 'breeds.json');
  const data = fs.readFileSync(filePath, 'utf8');
  const breeds = JSON.parse(data);

  const breedIds = breedNames.map(breedName => {
    const breed = breeds.find(b => b.name.toLowerCase() === breedName.toLowerCase());
    return breed ? breed.id : null;
  }).filter(id => id !== null);

  return breedIds;
}

// Reusable function to fetch random cat images
async function fetchRandomCatImages(limit = 1, breedNames = '') {
    
    try {
      let myurl=`https://api.thecatapi.com/v1/images/search?limit=${limit}&has_breeds=1`;
      let breedIds = [];
      if (breedNames) {
      const breedNamesArray = breedNames.split(',').map(name => name.trim());
      breedIds = findBreedIdsByNames(breedNamesArray);
      if (breedIds.length === 0) {
        myurl= `https://api.thecatapi.com/v1/images/search?limit=${limit}&has_breeds=1`
      }
      else {
        const breedIdsParam = breedIds.join(',');
        myurl= `https://api.thecatapi.com/v1/images/search?limit=${limit}&has_breeds=1&breed_ids=${breedIdsParam}`
      }
    }

    
    const response = await fetch(myurl, {
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.CAT_API_KEY,
      },
    });


    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      let retval=`CAT_IMAGE_URLS:${data.map(img => img.url).join(',')}`;
      if(breedNames){
        if (breedIds.length===0){
          retval="NO SPECIFIED BREEDS FOUND. SHOWING RANDOM CATS."+retval;
        }
        else{
          retval="ONE OR MORE BREEDS FOUND."+retval;
        }
      }
      return retval;
      
    } else {
      throw new Error("No cat images found.");
    }
  } catch (error) {
    console.error("Error fetching cat images:", error.message);
    throw error; // Re-throw the error to handle it in the caller
  }
}





app.listen(3000, () => {
  console.log('Server listening on port 3000');
});