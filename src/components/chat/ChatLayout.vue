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

// simple auth state (local mock)
const showAuth = ref(false)
const authMode = ref('login')
const authEmail = ref('')
const authPassword = ref('')
const user = ref(null)

function openAuth(mode = 'login') {
  authMode.value = mode
  showAuth.value = true
}
function closeAuth() {
  showAuth.value = false
}

function loadUser() {
  try {
    const raw = localStorage.getItem('chat_user')
    if (raw) user.value = JSON.parse(raw)
  } catch (e) {}
}

function saveUser(u) {
  user.value = u
  try { localStorage.setItem('chat_user', JSON.stringify(u)) } catch (e) {}
}

function logout() {
  user.value = null
  try { localStorage.removeItem('chat_user') } catch (e) {}
}

function doAuth() {
  // very simple mock: accept any non-empty email/password
  if (!authEmail.value || !authPassword.value) {
    try { alert('请输入邮箱和密码') } catch (e) {}
    return
  }
  const u = { name: authEmail.value.split('@')[0], email: authEmail.value }
  saveUser(u)
  closeAuth()
}

loadUser()
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

        <div class="top-actions">
          <div v-if="user" class="user-btn" title="已登录：{{ user.name }}" @click="logout">
            <span class="user-letter">{{ user.name.charAt(0).toUpperCase() }}</span>
          </div>
          <button v-else class="user-btn" @click="openAuth('login')" title="登录/注册">
            <span class="user-letter">👤</span>
          </button>
        </div>
      </header>

      <!-- Auth Modal -->
      <div v-if="showAuth" class="auth-overlay" @click.self="closeAuth">
        <div class="auth-modal">
          <h3>{{ authMode === 'login' ? '登录' : '注册' }}</h3>
          <div class="auth-form">
            <input v-model="authEmail" placeholder="邮箱" class="auth-input" />
            <input v-model="authPassword" type="password" placeholder="密码" class="auth-input" />
            <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:8px">
              <button class="btn" @click="closeAuth">取消</button>
              <button class="btn" @click="doAuth">{{ authMode === 'login' ? '登录' : '注册' }}</button>
            </div>
            <div style="margin-top:10px; font-size:13px; color:#9a9a9a">
              切换到 <a href="#" @click.prevent="authMode = authMode === 'login' ? 'register' : 'login'">{{ authMode === 'login' ? '注册' : '登录' }}</a>
            </div>
          </div>
        </div>
      </div>

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
.top-actions { display:flex; align-items:center; gap:10px }
.user-btn { width:40px; height:40px; border-radius:50%; background: rgba(255,255,255,0.04); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; border:none; box-shadow: 0 6px 18px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.03) }
.user-letter { font-weight:800; color:#081018; font-size:16px; background: linear-gradient(180deg,#fff,#f3f3f3); width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:50% }

/* auth modal */
.auth-overlay { position:fixed; inset:0; background: rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:70 }
.auth-modal { width:360px; background:#0f0f10; border-radius:8px; padding:16px; color:#eee }
.auth-form { display:flex; flex-direction:column; gap:8px; margin-top:8px }
.auth-input { padding:8px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.02); color:#fff }
.auth-modal .btn { background: transparent; border:1px solid rgba(255,255,255,0.04); color:#fff; padding:6px 10px; border-radius:6px; cursor:pointer }
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
