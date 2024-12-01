<!-- <script setup>
import { ref } from 'vue'
import { onMounted } from 'vue';

const message = ref('');

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/hello');
    const data = await response.text();
    message.value = data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});


</script> -->

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userMessage: '',
      chatHistory: [],
      catImages: [], // Holds the fetched cat image URL
    };
  },
  methods: {
    async sendMessage() {
      if (!this.userMessage.trim()) return;

      // Add user message to chat history
      this.chatHistory.push({ role: 'user', content: this.userMessage });

      try {
        const response = await axios.post('http://localhost:3000/api/chat', {
          message: this.userMessage,
        });

        // Add bot response to chat history
        this.chatHistory.push({ role: 'assistant', content: response.data.response });
      } catch (error) {
        console.error('Error:', error.message);
        this.chatHistory.push({ role: 'assistant', content: 'Oops, something went wrong!' });
      } finally {
        this.userMessage = '';
      }
    },

    async fetchCatImages() {
      const limit = 5; // Number of cat images to fetch
      try {
        const response = await fetch(`http://localhost:3000/api/random-cat?limit=${limit}`);
        const data = await response.json();
        if (data.images) {
          this.catImages = data.images;
        } else {
          console.error("No images received.");
        }
      } catch (error) {
        console.error("Error fetching cat images:", error);
      }
    },
  },
};
</script>

<template>
  
  <div class="chat-container">
    <h1>Cat Chatbot</h1>
    <div class="chat-window">
      <div v-for="(msg, index) in chatHistory" :key="index" class="message">
        <strong>{{ msg.role === 'user' ? 'You:' : 'Bot:' }}</strong> {{ msg.content }}
      </div>
    </div>
    <div class="input-area">
      <input
        v-model="userMessage"
        placeholder="Type your message..."
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">Send</button>
    </div>
  </div>

  <div>
    <button @click="fetchCatImages">Get Random Cats</button>
    <div v-if="catImages.length">
      <div v-for="(image, index) in catImages" :key="index">
        <img :src="image" alt="Random Cat" />
      </div>
    </div>
    <div v-else>
      <p>No cat images yet. Press the button!</p>
    </div>
  </div>


</template>

<style scoped>
.chat-container {
  max-width: 600px;
  margin: auto;
  font-family: Arial, sans-serif;
  text-align: center;
}

.chat-window {
  height: 400px;
  overflow-y: scroll;
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
}

.message {
  margin: 5px 0;
}

.input-area {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
}

button {
  padding: 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
