import { createEchoProvider } from './provider-echo'
import { createOpenAIProvider } from './provider-openai'

// Registry of available model providers. Add new providers here.
export function getProvidersRegistry() {
  const list = [
    createEchoProvider(),
    createOpenAIProvider(),
  ]
  // Filter out providers possibly disabled by env flags in future
  return list
}
