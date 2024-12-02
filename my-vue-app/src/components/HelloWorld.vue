

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
  <div class="grid home m-0">
    
    <div class="col-1 gren"></div>
    <div class="col-4 flex flex-column gren">

    <div class="top40 fixed w-4">
      <img src="/nekologo.png" alt="Neko Logo" style="width: 100px;" />  
      <h1 class="whit">neko.eco</h1>
      <div class="grid">
        <div class="col-9 pb-0">
        <InputText
          class="w-full"
          v-model="userMessage"
          placeholder="Type your message..."
          @keyup.enter="sendMessage"
        />
      </div>
      <div class="col-2">
        <Button severity="secondary" @click="sendMessage">↗</Button>
      </div>
      <div class="col-1"></div>
      </div>
      </div>
    </div>

    <div class="col-1 beig"></div>
    <div class="col-5 beig">
      <div v-for="(msg, index) in chatHistory" :key="index">
        <template v-if="msg.role === 'user'">
          <Panel class="userpan gren whit mb-3 p-0">
            <template #header>
              <p class="whit pb-0 mb-0"><strong>Me</strong></p>
            </template>
            <Markdown class="marky p-0 m-0" :source="msg.content" />
          </Panel>
        </template>
        <template v-else>
          <Panel class="botpan p-0 mb-3" toggleable >
            <template #header>
              <p class="pb-0 mb-0"><strong>Neko.eco</strong></p>
            </template>
            <Markdown class="marky p-0 m-0" :source="msg.content" />
          </Panel>
          <hr class="dashed mb-3">
        </template>
      </div>
    </div>
    <div class="col-1 beig"></div>
    
  </div>

</template>

<style>

body{
  margin:0 !important;
}

html, body{min-height:100%;}
body{height:100vh;}
.p-inputtext{
  height: 37px;
}
.whit{
  color: #fcffff !important;
}
.gren{
  background-color: #2f7d5f !important;
}

.home{
  height:100%;
}
.top40{
  margin-top: 20em;
}

.beig{
  background-color: #edeee9 !important;
}
hr.dashed {
  border-top: 3px dashed #bbb;
}

.marky img {
  
  max-width: 150px !important;
  height: auto !important;
}
</style>

