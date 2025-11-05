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
  <button type="button" class="addon" aria-label="add">+</button>
  <textarea rows="1" class="input" v-model="text" :disabled="sending" @keydown="onKey" placeholder="有什么可以帮忙的？"></textarea>
    <button class="send" :disabled="sending || !text.trim()" @click="doSend" :aria-disabled="sending || !text.trim()" aria-label="发送">
      <template v-if="sending">
        <span class="dots">...</span>
      </template>
      <template v-else>
        <!-- upward arrow SVG -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 19V6" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 12l7-7 7 7" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </template>
    </button>
  </div>
</template>

<style scoped>
.input-wrap { display:flex; align-items:center; gap:12px; max-width: 760px; width: 100%; padding: 10px 14px; background: rgba(255,255,255,0.02); border-radius: 999px; box-shadow: 0 6px 18px rgba(0,0,0,0.55); }
.addon { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.03); border: none; color: #fff; font-size: 20px; display:flex; align-items:center; justify-content:center; cursor: pointer; }
.input { flex: 1; resize: none; height: 44px; padding: 0 8px; border: none; background: transparent; color: #fff; outline: none; font-size: 15px; text-align: center; line-height: 44px; }
.input::placeholder { color: #9ca3af; text-align: center; }
.send { width: 44px; height: 44px; border-radius: 50%; background: #fff; color: #000; border: none; display:flex; align-items:center; justify-content:center; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.35); padding:0; }
.send svg { display:block; }
.send .dots { color: #000; font-weight: 700; }
.send:disabled { background: #9ca3af; color: #fff; cursor: not-allowed; }
</style>
