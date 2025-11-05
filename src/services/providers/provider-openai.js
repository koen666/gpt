// OpenAI (or Azure OpenAI) provider skeleton. Uses fetch to call the chat completions API.
// For security, do NOT hardcode keys. Users can input keys in the sidebar; we store them in localStorage.

const OPENAI_API = 'https://api.openai.com/v1/chat/completions'

export function createOpenAIProvider() {
  return {
    id: 'openai',
    name: 'OpenAI GPT-*',
    description: '需要 API Key，走浏览器直连。仅示例，注意浏览器暴露密钥的风险。',
    settings: [
      { key: 'apiKey', label: 'API Key', placeholder: 'sk-...', secret: true },
      { key: 'baseUrl', label: 'Base URL', placeholder: OPENAI_API, secret: false },
      { key: 'model', label: 'Model', placeholder: 'gpt-4o-mini', secret: false },
    ],
    async sendMessage(text, ctx) {
      const secrets = ctx?.providerSecrets || {}
      const apiKey = secrets.apiKey
      const baseUrl = secrets.baseUrl || OPENAI_API
      const model = secrets.model || 'gpt-4o-mini'

      if (!apiKey) throw new Error('请先在左侧填写 OpenAI API Key')

      const history = (ctx?.messages || [])
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-6) // keep short for demo
        .map(m => ({ role: m.role, content: m.content }))

      const body = {
        model,
        messages: [...history, { role: 'user', content: text }],
        temperature: 0.7,
      }

      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`OpenAI API 错误: ${res.status} ${errText}`)
      }

      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content || '(空响应)'
      return content
    },
  }
}
