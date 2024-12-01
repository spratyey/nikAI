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
        console.log("oracle: "+JSON.parse(tool.function.arguments).limit);
        if (tool.function.name === "fetchRandomCatImages") {
          const limit = JSON.parse(tool.function.arguments).limit ? JSON.parse(tool.function.arguments).limit : 1;
          const images = await fetchRandomCatImages(limit);
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
      instructions: 'You can call fetchRandomCatImages(limit) to fetch cat images.',
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



// Reusable function to fetch random cat images
async function fetchRandomCatImages(limit = 1) {
    try {
    const response = await fetch(`https://api.thecatapi.com/v1/images/search?limit=${limit}&has_breeds=1`, {
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.CAT_API_KEY, // Replace with your Cat API key in .env
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      console.log(`CAT_IMAGES:${data.map(img => img.url).join(',')}`);
      return `CAT_IMAGES:${data.map(img => img.url).join(',')}`;
    } else {
      throw new Error("No cat images found.");
    }
  } catch (error) {
    console.error("Error fetching cat images:", error.message);
    throw error; // Re-throw the error to handle it in the caller
  }
}

// Endpoint using the reusable function
app.get('/api/random-cat', async (req, res) => {
  const limit = parseInt(req.query.limit) || 1; // Default to 1 if no limit is provided
  if (limit < 1 || limit > 10) {
    return res.status(400).json({ error: 'Limit must be between 1 and 10.' });
  }

  try {
    const catImages = await fetchRandomCatImages(limit);
    res.json(catImages); // Send the response as JSON
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cat images." });
  }
});



app.listen(3000, () => {
  console.log('Server listening on port 3000');
});