<script setup>
import ModelSelector from './parts/ModelSelector.vue'
</script>

<template>
  <div class="sidebar-wrap">
    <h3>设置</h3>
    <ModelSelector />

    <div class="tips">
      <p>· 选择模型并填写所需的密钥。</p>
      <p>· 本地模拟模型无需配置，用于演示 UI。</p>
    </div>
  </div>
</template>

<style scoped>
.sidebar-wrap { padding: 12px; }
.sidebar-wrap h3 { margin-bottom: 8px; font-weight: 700; }
.tips { margin-top: 16px; font-size: 12px; color: var(--vt-c-text-light-2); }
</style>
