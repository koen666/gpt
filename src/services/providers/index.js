import { createStubProvider } from './provider-stub'

// Registry of available model providers. Replace or extend with real providers later.
export function getProvidersRegistry() {
  const list = [
    createStubProvider({ id: 'deepseek', name: 'DeepSeek', description: 'DeepSeek' }),
    createStubProvider({ id: 'doubao', name: '豆包', description: '豆包' }),
    createStubProvider({ id: 'chatgpt', name: 'ChatGPT', description: 'ChatGPT' }),
    createStubProvider({ id: 'gemeni', name: 'Gemeni', description: 'Gemen' }),
  ]

  return list
}
