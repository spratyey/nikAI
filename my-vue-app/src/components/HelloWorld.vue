

<script>
import axios from 'axios';
import { marked } from 'marked';
import Markdown from 'vue3-markdown-it';

export default {
  components: {
    Markdown
  },
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

        const botResponse = response.data.response;
        console.log(botResponse);
        
        this.chatHistory.push({ role: 'assistant', content: botResponse[0].text.value });
        
      } catch (error) {
        console.error('Error:', error.message);
        this.chatHistory.push({ role: 'assistant', content: 'Oops, something went wrong!' });
        await this.terminateRun();
      } finally {
        this.userMessage = '';
      }
    },
    async terminateRun() {
      try {
        const response = await axios.post('http://localhost:3000/api/terminate-run');
        console.log('Run terminated:', response.data);
      } catch (error) {
        console.error('Error terminating run:', error.message);
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
        <strong>{{ msg.role === 'user' ? 'You:' : 'Bot:' }}</strong>
        <Markdown class="marky" :source="msg.content" />
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

</template>

<style>
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

.marky img {
  
  max-width: 100px !important;
  height: auto !important;
}
</style>

