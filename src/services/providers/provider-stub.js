// A small stub provider generator for UI/demo purposes.
// Returns a provider object with a mock sendMessage implementation.

export function createStubProvider({ id, name, description = '', settings = [] }) {
  return {
    id,
    name,
    description,
    settings,
    async sendMessage(text, ctx) {
      // simple simulated delay + reply to keep UI interactive
      await new Promise(r => setTimeout(r, 350))
      const suffix = `（来自 ${name} 模拟回复）`
      return `你对 ${name} 说：${text}\n\n回复：收到！ ${suffix}`
    },
  }
}
