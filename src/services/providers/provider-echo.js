// A simple mock provider that echoes the last user message with a friendly response.
export function createEchoProvider() {
  return {
    id: 'echo',
    name: '内置·本地模拟',
    description: '无需配置，便于调试 UI。',
    settings: [], // no secrets required
    async sendMessage(text, _ctx) {
      await new Promise(r => setTimeout(r, 300))
      const suffixes = [
        '（来自本地模拟模型）',
        '（Mock 回复）',
        '（仅作演示，非真实推理）',
      ]
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
      return `你说：${text}\n\n我的回复：收到啦 👍 ${suffix}`
    },
  }
}
