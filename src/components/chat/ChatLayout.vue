<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import { useChatStore } from '../../stores/useChatStore'

const { state, sendMessage, clear } = useChatStore()

// sidebar collapse state
const collapsed = ref(false)
function toggleSidebar() { collapsed.value = !collapsed.value }
</script>

<template>
  <div :class="['chat-layout', { collapsed }]">
    <aside class="sidebar">
      <Sidebar />
      <button class="collapse-btn" @click="toggleSidebar" :aria-pressed="collapsed.toString()" :title="collapsed ? '展开边栏' : '关闭边栏'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </aside>
    <section class="conversation">
      <header class="topbar">
        <div class="title">AI Chat</div>
      </header>

      <MessageList :messages="state.messages" />

      <footer class="bottombar">
        <ChatInput :sending="state.isSending" @send="sendMessage" />
      </footer>
    </section>
  </div>
</template>

<style scoped>
.chat-layout { display: grid; grid-template-columns: 280px 1fr; height: 100vh; transition: grid-template-columns 220ms ease; }
.chat-layout.collapsed { grid-template-columns: 64px 1fr; }
.sidebar { /* remove harsh border, use subtle shadow */
    background: var(--color-background-soft);
    overflow: auto;
    box-shadow: inset -1px 0 0 rgba(255,255,255,0.02);
    position: relative;
  }
.conversation { display: grid; grid-template-rows: 48px 1fr 140px; height: 100%; min-height: 0; }
.topbar { display:flex; align-items:center; justify-content:space-between; padding: 0 12px; /* subtle divider removed for cleaner look */ }
.title { font-weight: 600; }
  .bottombar { /* remove top border, rely on soft background and spacing */
    display:flex; align-items:center; justify-content:center; padding: 20px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.01);
  }

/* collapse button */
.collapse-btn { position: absolute; right: -14px; top: 12px; width: 28px; height: 28px; display:flex; align-items:center; justify-content:center; border-radius:6px; border:none; background: rgba(255,255,255,0.04); color: #fff; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
.chat-layout.collapsed .sidebar .sidebar-wrap { display: none; }
.chat-layout.collapsed .collapse-btn { right: -14px; transform: rotate(180deg); }
</style>
