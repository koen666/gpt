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
      messages: state.messages,
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

  const state = reactive({
    providers,
    providerSecrets: saved.providerSecrets || {}, // {providerId: {apiKey: ''}}
    activeModelId: saved.activeModelId || providers[0]?.id || 'echo',
    messages: saved.messages || [], // {id, role: 'user'|'assistant'|'system', content, modelId}
    isSending: false,
    error: null,
  })

  const activeProvider = computed(() =>
    state.providers.find(p => p.id === state.activeModelId) || state.providers[0]
  )

  function setActiveModel(id) {
    state.activeModelId = id
  }

  function setProviderSecret(providerId, key, value) {
    if (!state.providerSecrets[providerId]) state.providerSecrets[providerId] = {}
    state.providerSecrets[providerId][key] = value
  }

  function clear() {
    state.messages = []
  }

  async function sendMessage(text) {
    if (!text?.trim()) return
    const userMsg = { id: uuidv4(), role: 'user', content: text, modelId: state.activeModelId }
    state.messages.push(userMsg)

    const provider = activeProvider.value
    if (!provider) {
      state.error = 'No provider selected'
      return
    }

    state.isSending = true
    state.error = null

    try {
      const context = { messages: state.messages, providerSecrets: state.providerSecrets[provider.id] || {} }
      const replyText = await provider.sendMessage(text, context)
      state.messages.push({ id: uuidv4(), role: 'assistant', content: replyText, modelId: provider.id })
    } catch (e) {
      console.error(e)
      state.error = e?.message || '发送失败'
    } finally {
      state.isSending = false
    }
  }

  watch(state, () => persistState(state), { deep: true })

  _store = { state, activeProvider, setActiveModel, setProviderSecret, sendMessage, clear }
  return _store
}
