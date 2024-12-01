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


app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  // const userMessage = "Hi, what company do I work for?"
  // console.log(userMessage);

  try {
    // Step 3: Add user message to the thread
    await openai.beta.threads.messages.create(THREAD_ID, {
      role: 'user',
      content: userMessage,
    });

    // Step 4: Create and poll a run
    const run = await openai.beta.threads.runs.createAndPoll(THREAD_ID, {
      assistant_id: ASSISTANT_ID,
      instructions: 'Please address the user as a fellow cat enthusiast!',
    });

    // Step 5: Retrieve the assistant's response messages
    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(THREAD_ID);
      const assistantMessage = messages.data
        .find((msg) => msg.role === 'assistant');
      return res.json({ response: assistantMessage.content[0].text.value });
    } else {
      return res.status(500).json({ error: 'Run did not complete successfully.' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to process the request.' });
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
      return { images: data.map(img => img.url) };
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