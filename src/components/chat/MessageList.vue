<script setup>
import { onUpdated, ref } from 'vue'
import aiAvatar from '../../assets/image/chatgpt.png'

const props = defineProps({
  messages: { type: Array, required: true },
})

const scroller = ref(null)

onUpdated(() => {
  // scroll to bottom when messages change
  const el = scroller.value
  if (el) el.scrollTop = el.scrollHeight
})
</script>

<template>
  <div class="list" ref="scroller">
    <div v-if="!messages.length" class="empty">开始聊天吧～</div>
    <div v-for="m in messages" :key="m.id" class="msg" :class="m.role">
      <div class="avatar">
        <img v-if="m.role === 'assistant'" :src="aiAvatar" alt="AI" />
        <span v-else>我</span>
      </div>
      <div class="bubble">
        <div class="content">{{ m.content }}</div>
        <div class="meta">{{ m.modelId }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list { padding: 12px; overflow: auto; }
.empty { color: var(--vt-c-text-light-2); text-align:center; margin-top: 30px; }
.msg { display:flex; gap: 10px; margin-bottom: 12px; }
.msg.user { flex-direction: row-reverse; }
.avatar { flex: 0 0 28px; height: 28px; border-radius: 50%; background: var(--color-background-mute); display:flex; align-items:center; justify-content:center; font-size: 12px; overflow:hidden; }
.avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.bubble { max-width: 78ch; }
.content { white-space: pre-wrap; background: var(--color-background-soft); border: 1px solid var(--color-border); padding: 8px 10px; border-radius: 8px; }
.msg.user .content { background: #e8f5e9; }
.meta { font-size: 11px; color: var(--vt-c-text-light-2); margin-top: 2px; }
</style>
