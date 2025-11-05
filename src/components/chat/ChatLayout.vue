<script setup>
import Sidebar from './Sidebar.vue'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import { useChatStore } from '../../stores/useChatStore'

const { state, sendMessage, clear } = useChatStore()
</script>

<template>
  <div class="chat-layout">
    <aside class="sidebar">
      <Sidebar />
    </aside>
    <section class="conversation">
      <header class="topbar">
        <div class="title">AI Chat · 可切换模型</div>
        <button class="clear" @click="clear" :disabled="state.isSending">清空</button>
      </header>

      <MessageList :messages="state.messages" />

      <footer class="bottombar">
        <ChatInput :sending="state.isSending" @send="sendMessage" />
      </footer>
    </section>
  </div>
</template>

<style scoped>
.chat-layout { display: grid; grid-template-columns: 280px 1fr; height: 100vh; }
.sidebar { border-right: 1px solid var(--color-border); background: var(--color-background-soft); overflow: auto; }
.conversation { display: grid; grid-template-rows: 48px 1fr 92px; height: 100%; }
.topbar { display:flex; align-items:center; justify-content:space-between; padding: 0 12px; border-bottom:1px solid var(--color-border); }
.title { font-weight: 600; }
.clear { background: transparent; border:1px solid var(--color-border); padding:4px 8px; border-radius:6px; cursor:pointer; }
.bottombar { border-top: 1px solid var(--color-border); padding: 10px; }
</style>
