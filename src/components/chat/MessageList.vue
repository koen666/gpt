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
  <div v-if="!messages.length" class="empty">有什么可以帮忙的？</div>
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
.list { padding: 12px; overflow: auto; display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }
.empty { color: #fff; text-align:center; margin: auto; font-size: 28px; opacity: 0.95; font-weight: 600; }
.msg { display:flex; gap: 10px; margin-bottom: 12px; }
.msg.user { flex-direction: row-reverse; }
.avatar { flex: 0 0 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.03); display:flex; align-items:center; justify-content:center; font-size: 12px; overflow:hidden; color: #fff; }
.avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.bubble { max-width: 78ch; }
.content { white-space: pre-wrap; background: rgba(255,255,255,0.03); color: #fff; border: none; padding: 8px 10px; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.45); }
.msg.user .content { background: rgba(255,255,255,0.03); color: #fff; }
.meta { font-size: 11px; color: #cfcfcf; margin-top: 2px; }
</style>
