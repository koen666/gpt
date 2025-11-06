<script setup>

import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import { useChatStore } from '../../stores/useChatStore'

const { state, activeProvider, sendMessage, clear, currentSession, sessionsForActiveModel, createSession, selectSession, deleteSession, setActiveModel } = useChatStore()

// sidebar collapse state
const collapsed = ref(false)
function toggleSidebar() { collapsed.value = !collapsed.value }
</script>

<template>
  <div :class="['chat-layout', { collapsed }]">
    <aside class="sidebar">
      <Sidebar />
    </aside>
    <section class="conversation">
      <header class="topbar">
        <div class="title" role="button" tabindex="0" @click="toggleSidebar" @keydown.enter="toggleSidebar" :title="collapsed ? '展开边栏' : '收起边栏'">
          {{ activeProvider && activeProvider.name ? activeProvider.name : 'AI Chat' }}
        </div>
      </header>

  <MessageList :messages="(currentSession && currentSession.messages) || []" />

      <footer class="bottombar">
        <ChatInput :sending="state.isSending" @send="sendMessage" />
      </footer>
    </section>
  </div>
</template>

<style scoped>
.chat-layout { display: grid; grid-template-columns: 280px 1fr; height: 100vh; transition: grid-template-columns 220ms ease; }
.chat-layout.collapsed { grid-template-columns: 0 1fr; }
.sidebar { /* remove harsh border, use subtle shadow */
    background: var(--color-background-soft);
    /* hide overflowing content when collapsing to avoid peeking */
    overflow: hidden;
    box-shadow: inset -1px 0 0 rgba(255,255,255,0.02);
    position: relative;
    transition: box-shadow 200ms ease;
  }
.sidebar .sidebar-wrap { height: 100%; overflow: auto; transition: opacity 180ms ease, transform 180ms ease; }
.conversation { display: grid; grid-template-rows: 48px 1fr 140px; height: 100%; min-height: 0; }
.topbar { display:flex; align-items:center; justify-content:space-between; padding: 0 12px; /* subtle divider removed for cleaner look */ }
.title { font-weight: 600; cursor: pointer; }
  .bottombar { /* remove top border, rely on soft background and spacing */
    display:flex; align-items:center; justify-content:center; padding: 20px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.01);
  }

.chat-layout.collapsed .sidebar {
  /* slightly stronger inner shadow when collapsed to hint separation */
  box-shadow: inset -1px 0 0 rgba(255,255,255,0.01);
}
.chat-layout.collapsed .sidebar .sidebar-wrap {
  opacity: 0; transform: translateX(-6px); pointer-events: none;
}
</style>
