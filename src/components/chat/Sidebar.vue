<script setup>
import { ref, computed } from 'vue'
import { useChatStore } from '../../stores/useChatStore'

import deepseekImg from '../../assets/image/deepseek.webp'
import doubaoImg from '../../assets/image/doubao.png'
import chatgptImg from '../../assets/image/chatgpt.png'

const { state, setActiveModel, sessionsForActiveModel, currentSession, createSession, selectSession, deleteSession, setProviderSecret } = useChatStore()
const providers = computed(() => state.providers || [])
const activeId = computed(() => state.activeModelId)
const sessions = computed(() => sessionsForActiveModel.value || [])

const icons = {
  deepseek: deepseekImg,
  doubao: doubaoImg,
  chatgpt: chatgptImg,
}

const showSettings = ref(false)

function select(id) { setActiveModel(id) }
function newChat() { createSession(state.activeModelId, '新会话') }
function pickSession(sid) { selectSession(state.activeModelId, sid) }
function removeSession(sid) { deleteSession(state.activeModelId, sid) }
function openSettings() { showSettings.value = true }
function closeSettings() { showSettings.value = false }

function setKey(providerId, value) { setProviderSecret(providerId, 'apiKey', value) }

function exportYaml() {
  const endpoint = window.__CONFIG_WRITER_ENDPOINT__ || 'http://localhost:4001/save-config'
  const data = {}
  for (const p of providers.value) {
    const s = (state.providerSecrets && state.providerSecrets[p.id]) || {}
    data[p.id] = { apiKey: s.apiKey || '' }
  }

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerSecrets: data }),
  })
    .then(r => {
      if (!r.ok) throw new Error('保存失败：' + r.status)
      return r.json()
    })
    .then(() => {
      try { alert('已保存到本地仓库路径 src/config/model.yaml（请在本地运行 save-config-server）') } catch (e) {}
      closeSettings()
    })
    .catch(err => {
      console.warn('Local save failed, falling back to download:', err)
      const yamlLines = []
      Object.keys(data).forEach(k => {
        yamlLines.push(`${k}:`)
        Object.keys(data[k]).forEach(kk => {
          yamlLines.push(`  ${kk}: "${String(data[k][kk]).replace(/"/g, '\\"')}"`)
        })
      })
      const blob = new Blob([yamlLines.join('\n')], { type: 'text/yaml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'model.yaml'
      a.click()
      URL.revokeObjectURL(url)
      try { alert('已下载 model.yaml，请将其放入项目的 src/config/model.yaml（或运行本地保存服务）。') } catch (e) {}
      closeSettings()
    })
}
</script>

<template>
  <div class="sidebar-wrap">
    <div class="sidebar-top">
      <button class="top-action" @click="newChat">
        <span class="act-ico">+</span>
        <span class="act-label">新建聊天</span>
      </button>

      <button class="top-action" @click="openSettings">
        <span class="act-ico">⚙</span>
        <span class="act-label">设置</span>
      </button>
    </div>

    <div class="model-section">
      <h4 class="section-title">模型</h4>
      <div class="model-list">
        <button v-for="p in providers" :key="p.id" :class="['model-card', { active: p.id === activeId } ]" @click="select(p.id)">
          <div class="avatar-wrap">
            <div class="avatar-inner">
              <img v-if="icons[p.id]" :src="icons[p.id]" :alt="p.name" />
              <span v-else class="avatar-letter">{{ p.name.charAt(0) }}</span>
            </div>
          </div>
          <div class="meta">
            <div class="name">{{ p.name }}</div>
            <div class="desc">{{ p.description }}</div>
          </div>
        </button>
      </div>
    </div>

    <div class="history-section">
      <h4 class="section-title">历史记录</h4>

      <div v-if="sessions && sessions.length" class="history-list">
        <button v-for="s in sessions" :key="s.id" class="history-item" :class="{ active: currentSession && currentSession.id === s.id }" @click="pickSession(s.id)">
          <div class="h-left">
            <div class="h-title">{{ s.title }}</div>
            <div class="h-meta">{{ new Date(s.createdAt).toLocaleString() }} · {{ s.messages?.length || 0 }} 条</div>
          </div>
          <div class="h-right">
            <button class="h-del" @click.stop="removeSession(s.id)">删除</button>
          </div>
        </button>
      </div>
      <div v-else class="history-empty">暂无历史，会话将自动保存。</div>
    </div>

    <!-- Settings Modal -->
    <div v-if="showSettings" class="settings-overlay" @click.self="closeSettings">
      <div class="settings-modal">
        <div class="settings-header">
          <h3>设置 — 模型 API</h3>
          <button class="close" @click="closeSettings">✕</button>
        </div>

        <div class="settings-body">
          <p>请为下面的模型填写对应的 API Key（会保存在本地浏览器）。</p>
          <div class="form">
            <div class="form-row" v-for="p in providers" :key="p.id">
              <label class="form-label">{{ p.name }}</label>
              <input class="form-input" :placeholder="`${p.name} API Key`" :value="(state.providerSecrets && state.providerSecrets[p.id] && state.providerSecrets[p.id].apiKey) || ''" @input="e => setKey(p.id, e.target.value)" />
            </div>
          </div>
        </div>

        <div class="settings-footer">
          <button class="btn" @click="closeSettings">关闭</button>
          <button class="btn" @click="exportYaml" style="margin-left:8px">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-wrap { padding: 10px 8px; display:flex; flex-direction:column; height:100%; color:#fff }
.sidebar-top { display:flex; flex-direction:column; gap:12px; margin-bottom:18px }
.top-action { display:flex; align-items:center; gap:12px; padding:6px 8px; border-radius:8px; background: transparent; border:none; color:#fff; cursor:pointer; width:100%; }
.top-action:hover { background: rgba(255,255,255,0.02) }
.act-ico { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; background: rgba(255,255,255,0.06); border-radius:8px; font-weight:800; color:#fff; font-size:18px }
.act-label { font-size:14px; font-weight:800; color:#fff }

/* Make the icon square slightly inset like screenshot */
.top-action .act-ico { box-shadow: inset 0 0 0 1px rgba(0,0,0,0.25); }

.model-section h4, .history-section h4 { margin:8px 0; font-size:13px; color:#cfcfcf }
.model-list { display:flex; flex-direction:column; gap:8px }
.model-card { display:flex; gap:12px; align-items:center; padding:12px; border-radius:12px; background: rgba(255,255,255,0.015); border:none; text-align:left; color:#fff; cursor:pointer; box-shadow: 0 0 0 1px rgba(0,0,0,0.12) inset }
.model-card:hover { background: rgba(255,255,255,0.03) }
.model-card.active { background: rgba(255,255,255,0.04); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02) }
.avatar-wrap { width:48px; height:48px; display:flex; align-items:center; justify-content:center }
.avatar-inner { width:44px; height:44px; border-radius:8px; background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden }
.avatar-inner img { width:100%; height:100%; object-fit:cover }
.avatar-letter { color:#111; font-weight:700 }
.meta .name { font-size:15px; font-weight:800 }
.meta .desc { font-size:12px; color:#a9a9a9; margin-top:2px }

.history-section { margin-top:18px; flex:1 }
.history-empty { color:#9a9a9a; font-size:13px; padding-top:8px }

.section-title { font-size:16px; font-weight:800; color:#e6e6e6; margin:10px 0 }

.history-list { display:flex; flex-direction:column; gap:8px; margin-top:6px }
.history-item { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:10px; border-radius:8px; background: rgba(255,255,255,0.01); border:none; color:#fff; text-align:left; cursor:pointer }
.history-item.active { background: rgba(255,255,255,0.03); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02) }
.history-item .h-left { display:flex; flex-direction:column; align-items:flex-start }
.h-title { font-size:14px; font-weight:700 }
.h-meta { font-size:12px; color:#a8a8a8; margin-top:4px }
.h-del { background: transparent; border: none; color: #ff7b7b; cursor:pointer; padding:6px }

/* settings modal */
.settings-overlay { position:fixed; inset:0; background: rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:60 }
.settings-modal { width:420px; background: #0f0f10; border-radius:10px; padding:14px; box-shadow: 0 12px 40px rgba(0,0,0,0.7); color:#eee }
.settings-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px }
.settings-header h3 { margin:0; font-size:16px }
.settings-header .close { background: transparent; border:none; color:#cfcfcf; font-size:18px; cursor:pointer }
.settings-body p { color:#bdbdbd; font-size:13px }
.form { margin-top:10px; display:flex; flex-direction:column; gap:10px }
.form-row { display:flex; gap:8px; align-items:center }
.form-label { width:90px; font-size:13px; color:#ddd }
.form-input { flex:1; padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.02); color:#fff }
.settings-footer { display:flex; justify-content:flex-end; margin-top:12px }
.settings-footer .btn { background: transparent; border:1px solid rgba(255,255,255,0.04); color:#fff; padding:6px 12px; border-radius:8px; cursor:pointer }
</style>

