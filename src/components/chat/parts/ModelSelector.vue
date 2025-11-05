<script setup>
import { computed } from 'vue'
import { useChatStore } from '../../../stores/useChatStore'

const { state, activeProvider, setActiveModel, setProviderSecret } = useChatStore()

const providers = computed(() => state.providers)
const current = activeProvider

function updateSecret(providerId, key, e) {
  setProviderSecret(providerId, key, e.target.value)
}
</script>

<template>
  <div class="model-selector">
    <label class="block">当前模型</label>
    <select class="select" :value="state.activeModelId" @change="e => setActiveModel(e.target.value)">
      <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.name }}</option>
    </select>

    <div v-if="current" class="provider-settings">
      <h4>参数：{{ current.name }}</h4>
      <p class="desc">{{ current.description }}</p>
      <div v-if="current.settings?.length" class="form">
        <div v-for="s in current.settings" :key="s.key" class="row">
          <label>{{ s.label }}</label>
          <input
            :type="s.secret ? 'password' : 'text'"
            :placeholder="s.placeholder"
            :value="state.providerSecrets?.[current.id]?.[s.key] || ''"
            @input="e => updateSecret(current.id, s.key, e)"
          />
        </div>
      </div>
      <div v-else class="hint">无需额外配置。</div>
    </div>
  </div>
</template>

<style scoped>
.block { display:block; font-size:12px; color: var(--vt-c-text-light-2); margin-bottom:4px; }
.select { width:100%; padding:6px 8px; border:1px solid var(--color-border); border-radius:6px; background:var(--color-background); }
.provider-settings { margin-top: 12px; }
.desc { font-size: 12px; color: var(--vt-c-text-light-2); margin: 4px 0 8px; }
.form { display: grid; gap: 8px; }
.row { display:grid; gap:4px; }
.row input { padding:6px 8px; border:1px solid var(--color-border); border-radius:6px; background:var(--color-background); }
.hint { font-size: 12px; color: var(--vt-c-text-light-2); }
</style>
