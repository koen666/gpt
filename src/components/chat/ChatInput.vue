<script setup>
import { ref } from 'vue'

const emit = defineEmits(['send'])
const props = defineProps({ sending: Boolean })

const text = ref('')

function doSend() {
  if (!text.value.trim() || props.sending) return
  emit('send', text.value)
  text.value = ''
}

function onKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    doSend()
  }
}
</script>

<template>
  <div class="input-wrap">
    <textarea class="input" v-model="text" :disabled="sending" @keydown="onKey" placeholder="输入消息，Enter 发送，Shift+Enter 换行"></textarea>
    <button class="send" :disabled="sending || !text.trim()" @click="doSend">{{ sending ? '发送中...' : '发送' }}</button>
  </div>
</template>

<style scoped>
.input-wrap { display: grid; grid-template-columns: 1fr 96px; gap: 8px; }
.input { resize: none; height: 72px; padding: 8px 10px; border:1px solid var(--color-border); border-radius:8px; background:var(--color-background); }
.send { border: none; background: #16a34a; color: #fff; border-radius: 8px; cursor: pointer; }
.send:disabled { background: #9ca3af; cursor: not-allowed; }
</style>
