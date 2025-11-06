<script setup>
import { computed } from 'vue'
import { useChatStore } from '../../stores/useChatStore'
import deepseekImg from '../../assets/image/deepseek.webp'
import doubaoImg from '../../assets/image/doubao.png'
import chatgptImg from '../../assets/image/chatgpt.png'

const { state, setActiveModel, sessionsForActiveModel, currentSession, createSession, selectSession, deleteSession, setProviderSecret } = useChatStore()
const providers = computed(() => state.providers)
const activeId = computed(() => state.activeModelId)
const sessions = computed(() => sessionsForActiveModel.value)


const icons = {
  deepseek: deepseekImg,
  doubao: doubaoImg,
  chatgpt: chatgptImg,
}

function select(id) { setActiveModel(id) }
function newSession() { createSession(state.activeModelId, '新会话') }
function pickSession(sid) { selectSession(state.activeModelId, sid) }
function removeSession(sid) { deleteSession(state.activeModelId, sid) }
function newChat() { createSession(state.activeModelId, '新会话') }
import { ref } from 'vue'
const showSettings = ref(false)
function openSettings() { showSettings.value = true }
function closeSettings() { showSettings.value = false }

function setKey(providerId, value) {
  setProviderSecret(providerId, 'apiKey', value)
}

function exportYaml() {
  // Try to POST to a local dev server which writes the file to ./src/config/model.yaml
  const endpoint = window.__CONFIG_WRITER_ENDPOINT__ || 'http://localhost:4001/save-config'
  const data = {}
  for (const p of providers.value) {
    const s = (state.providerSecrets && state.providerSecrets[p.id]) || {}
    data[p.id] = { apiKey: s.apiKey || '' }
  }

  // POST to local writer; if it fails, fallback to download
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
      // success - notify and close
      try { alert('已保存到本地仓库路径 src/config/model.yaml（请在本地运行 save-config-server）') } catch (e) {}
      closeSettings()
    })
    .catch(err => {
      console.warn('Local save failed, falling back to download:', err)
      // fallback: download file
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
    <div class="sidebar-actions">
      <button class="sa-btn" @click="newChat"><span class="sa-ico">✚</span><span class="sa-label">新建聊天</span></button>
      <button class="sa-btn" @click="openSettings"><span class="sa-ico">⚙</span><span class="sa-label">设置</span></button>
    </div>

    <h3>模型</h3>

    <div class="model-list">
      <button
        v-for="p in providers"
        :key="p.id"
        :class="['model-card', { active: p.id === activeId } ]"
        @click="select(p.id)"
      >
        <div class="avatar">
          <img v-if="icons[p.id]" :src="icons[p.id]" :alt="p.name" />
          <span v-else>{{ p.name.charAt(0) }}</span>
        </div>
        <div class="meta">
          <div class="name">{{ p.name }}</div>
          <div class="desc">{{ p.description }}</div>
        </div>
      </button>
    </div>

    <div style="margin-top:14px">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px">
        <h3 style="margin:0">历史记录</h3>
      </div>

      <div class="session-list">
        <button v-for="s in sessions" :key="s.id" :class="['session-item', { active: currentSession && currentSession.id === s.id }]" @click="pickSession(s.id)">
          <div class="s-left">
            <div class="s-title">{{ s.title }}</div>
            <div class="s-time">{{ new Date(s.createdAt).toLocaleString() }}</div>
          </div>
          <div class="s-right">
            <button class="btn-del" @click.stop="removeSession(s.id)">删除</button>
          </div>
        </button>
        <div v-if="!sessions || sessions.length===0" class="no-sessions">暂无历史，会话将自动保存。</div>
      </div>
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
.sidebar-wrap { padding: 12px; }
.sidebar-wrap h3 { margin-bottom: 8px; font-weight: 700; color: #d6d6d6 }
.model-list { display: grid; gap: 8px; }
.model-card { display:flex; gap: 8px; align-items:flex-start; padding:10px; border-radius:8px; background: rgba(255,255,255,0.02); border: none; color: #fff; text-align: left; cursor: pointer; }
.model-card:hover { background: rgba(255,255,255,0.03); }
.model-card.active { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03); background: rgba(255,255,255,0.035); }
.model-card .avatar { width:36px; height:36px; border-radius: 8px; background: rgba(255,255,255,0.04); display:flex; align-items:center; justify-content:center; font-weight:700; overflow: hidden }
.model-card .avatar img { width: 100%; height: 100%; object-fit: cover; display:block }
.model-card .meta .name { font-size:14px; font-weight:600 }
.model-card .meta .desc { font-size:12px; color: #a9a9a9; margin-top:4px }

/* sessions */
.btn-new { background: transparent; border: 1px solid rgba(255,255,255,0.04); color: #fff; padding:4px 8px; border-radius:6px; cursor:pointer }
.session-list { display: grid; gap:8px; margin-top:6px }
.session-item { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px; border-radius:8px; background: rgba(255,255,255,0.01); border:none; color:#fff; text-align:left; cursor:pointer }
.session-item .s-left { flex:1; text-align:left }
.session-item .s-title { font-size:13px; font-weight:600 }
.session-item .s-time { font-size:11px; color:#a8a8a8; margin-top:4px }
.session-item .btn-del { background: transparent; border: none; color: #ff7b7b; cursor:pointer; padding:6px }
.session-item.active { background: rgba(255,255,255,0.03); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02) }
.no-sessions { color:#9a9a9a; font-size:13px; padding:8px }

/* sidebar actions (ChatGPT-like) */
.sidebar-actions { display:flex; flex-direction:column; gap:8px; margin-bottom:8px }
.sa-btn { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:8px; background: transparent; border: none; color:#fff; cursor:pointer; text-align:left }
.sa-btn:hover { background: rgba(255,255,255,0.02) }
.sa-ico { width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.03); border-radius:6px; font-size:14px }
.sa-label { font-size:13px; font-weight:600 }

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
