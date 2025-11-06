import { reactive, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { getProvidersRegistry } from '../services/providers'

const STORAGE_KEY = 'ai-chat-state-v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load saved state', e)
    return null
  }
}

function persistState(state) {
  try {
    const copy = {
      messagesByModel: state.messagesByModel,
      currentSessionByModel: state.currentSessionByModel,
      activeModelId: state.activeModelId,
      providerSecrets: state.providerSecrets,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(copy))
  } catch (e) {
    console.warn('Failed to persist state', e)
  }
}

let _store

export function useChatStore() {
  if (_store) return _store

  const saved = loadState() || {}
  const providers = getProvidersRegistry()

  // messagesByModel: { [modelId]: [ { id: sessionId, title, createdAt, messages: [...] }, ... ] }
  const messagesByModelSaved = saved.messagesByModel || {}
  const currentSessionByModelSaved = saved.currentSessionByModel || {}

  const state = reactive({
    providers,
    providerSecrets: saved.providerSecrets || {},
    activeModelId: saved.activeModelId || providers[0]?.id || 'echo',
    messagesByModel: messagesByModelSaved,
    currentSessionByModel: currentSessionByModelSaved,
    isSending: false,
    error: null,
  })

  const activeProvider = computed(() =>
    state.providers.find(p => p.id === state.activeModelId) || state.providers[0]
  )

  function setActiveModel(id) {
    state.activeModelId = id
    // ensure there's at least one session for this model
    if (!state.messagesByModel[id]) state.messagesByModel[id] = []
    if (!state.currentSessionByModel[id] && state.messagesByModel[id].length) {
      state.currentSessionByModel[id] = state.messagesByModel[id][0].id
    }
  }

  function setProviderSecret(providerId, key, value) {
    if (!state.providerSecrets[providerId]) state.providerSecrets[providerId] = {}
    state.providerSecrets[providerId][key] = value
  }

  function createSession(modelId, title) {
    const sid = uuidv4()
    const session = { id: sid, title: title || `会话 ${new Date().toLocaleString()}`, createdAt: Date.now(), messages: [] }
    if (!state.messagesByModel[modelId]) state.messagesByModel[modelId] = []
    state.messagesByModel[modelId].unshift(session)
    state.currentSessionByModel[modelId] = sid
    return session
  }

  function selectSession(modelId, sessionId) {
    if (!state.messagesByModel[modelId]) return
    const found = state.messagesByModel[modelId].find(s => s.id === sessionId)
    if (found) state.currentSessionByModel[modelId] = sessionId
  }

  function deleteSession(modelId, sessionId) {
    if (!state.messagesByModel[modelId]) return
    state.messagesByModel[modelId] = state.messagesByModel[modelId].filter(s => s.id !== sessionId)
    if (state.currentSessionByModel[modelId] === sessionId) {
      state.currentSessionByModel[modelId] = state.messagesByModel[modelId]?.[0]?.id || null
    }
  }

  function clearCurrentSession(modelId) {
    const sid = state.currentSessionByModel[modelId]
    if (!sid) return
    const session = state.messagesByModel[modelId]?.find(s => s.id === sid)
    if (session) session.messages = []
  }

  const sessionsForActiveModel = computed(() => {
    return state.messagesByModel[state.activeModelId] || []
  })

  const currentSession = computed(() => {
    const sid = state.currentSessionByModel[state.activeModelId]
    return (state.messagesByModel[state.activeModelId] || []).find(s => s.id === sid) || null
  })

  async function sendMessage(text) {
    if (!text?.trim()) return
    const modelId = state.activeModelId
    if (!state.messagesByModel[modelId] || !state.currentSessionByModel[modelId]) {
      // create a session automatically if none
      const s = createSession(modelId, '新会话')
    }
    const sid = state.currentSessionByModel[modelId]
    const session = state.messagesByModel[modelId].find(s => s.id === sid)
    if (!session) return

    const userMsg = { id: uuidv4(), role: 'user', content: text, modelId }
    session.messages.push(userMsg)

    const provider = activeProvider.value
    if (!provider) {
      state.error = 'No provider selected'
      return
    }

    state.isSending = true
    state.error = null

    try {
      const context = { messages: session.messages, providerSecrets: state.providerSecrets[provider.id] || {} }
      const replyText = await provider.sendMessage(text, context)
      session.messages.push({ id: uuidv4(), role: 'assistant', content: replyText, modelId: provider.id })
    } catch (e) {
      console.error(e)
      state.error = e?.message || '发送失败'
    } finally {
      state.isSending = false
    }
  }

  function clear() {
    // clear current session for active model
    clearCurrentSession(state.activeModelId)
  }

  watch(state, () => persistState(state), { deep: true })

  _store = { state, activeProvider, sessionsForActiveModel, currentSession, createSession, selectSession, deleteSession, setActiveModel, setProviderSecret, sendMessage, clear }
  return _store
}
