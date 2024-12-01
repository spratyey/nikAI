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
      catImages: [], // Holds the fetched cat image URLs
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

        // Check if the bot's response includes cat images
        const botResponse = response.data.response;
        console.log(botResponse);
        // if (botResponse.startsWith('CAT_IMAGES:')) {
        //   this.catImages = botResponse.content.replace('CAT_IMAGES:', '').split(',');
        // }
        this.chatHistory.push({ role: 'assistant', content: botResponse[0].text.value });
        
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

  <div class="cat-images-section">
    <h2>Cat Images</h2>
    <button @click="fetchCatImages">Get Random Cats</button>
    <div v-if="catImages.length">
      <div v-for="(image, index) in catImages" :key="index" class="cat-image">
        <img :src="image" alt="Random Cat" />
      </div>
    </div>
    <div v-else>
      <p>No cat images yet. Press the button or chat with the bot!</p>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

.chat-window {
  height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  padding: 10px;
}

.input-area {
  display: flex;
  gap: 10px;
}

.cat-images-section {
  margin-top: 20px;
}

.cat-image {
  margin-bottom: 10px;
}

.cat-image img {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 10px;
}
</style>

