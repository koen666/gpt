<script setup>
import { computed } from 'vue'
import { useChatStore } from '../../stores/useChatStore'
import deepseekImg from '../../assets/image/deepseek.webp'
import doubaoImg from '../../assets/image/doubao.png'
import chatgptImg from '../../assets/image/chatgpt.png'

const { state, setActiveModel } = useChatStore()
const providers = computed(() => state.providers)
const activeId = computed(() => state.activeModelId)

const icons = {
  deepseek: deepseekImg,
  doubao: doubaoImg,
  chatgpt: chatgptImg,
}

function select(id) { setActiveModel(id) }
</script>

<template>
  <div class="sidebar-wrap">
    <h3>模型</h3>

    <div class="model-list">
      <button
        v-for="p in providers"
        :key="p.id"
        :class="['model-card', { active: p.id === activeId } ]"
        @click="select(p.id)"
      >
        <div class="avatar">
          <img v-if="icons[p.id]" :src="icons[p.id]" :alt="p.name" />
          <span v-else>{{ p.name.charAt(0) }}</span>
        </div>
        <div class="meta">
          <div class="name">{{ p.name }}</div>
          <div class="desc">{{ p.description }}</div>
        </div>
      </button>
    </div>

  </div>
</template>

<style scoped>
.sidebar-wrap { padding: 12px; }
.sidebar-wrap h3 { margin-bottom: 8px; font-weight: 700; color: #d6d6d6 }
.model-list { display: grid; gap: 8px; }
.model-card { display:flex; gap: 8px; align-items:flex-start; padding:10px; border-radius:8px; background: rgba(255,255,255,0.02); border: none; color: #fff; text-align: left; cursor: pointer; }
.model-card:hover { background: rgba(255,255,255,0.03); }
.model-card.active { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03); background: rgba(255,255,255,0.035); }
.model-card .avatar { width:36px; height:36px; border-radius: 8px; background: rgba(255,255,255,0.04); display:flex; align-items:center; justify-content:center; font-weight:700; overflow: hidden }
.model-card .avatar img { width: 100%; height: 100%; object-fit: cover; display:block }
.model-card .meta .name { font-size:14px; font-weight:600 }
.model-card .meta .desc { font-size:12px; color: #a9a9a9; margin-top:4px }

</style>
