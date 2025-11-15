# 多模型可切换的 AI 聊天框架

基于 Vue 3 + Vite 的前端聊天骨架，内置“本地模拟模型（无需配置）”与 OpenAI Provider 示例，可在左侧自由切换模型。

目前可访问地址[http:](http://gpt.koen.top/)

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## 功能概览

- 左侧选择模型并填写密钥（本地模拟模型无需密钥）
- 统一 Provider 适配层：轻松新增/切换多家大模型
- 本地持久化：聊天记录与密钥保存在浏览器 LocalStorage
- 干净的 UI：消息列表、输入区、清空按钮等

## 开发与运行

```powershell
npm install
npm run dev
```

### 生产构建

```powershell
npm run build
```

## 如何接入新模型

1. 在 `src/services/providers/` 新增一个 `provider-*.js` 文件，导出 `createXxxProvider()`，并实现：
  - `id`: 唯一标识
  - `name`: 展示名称
  - `description`: 简要说明
  - `settings`: 需要的配置项（例如 apiKey、baseUrl、model 等）
  - `async sendMessage(text, ctx)`: 请求模型并返回字符串回复
2. 在 `src/services/providers/index.js` 中加入到注册列表。
3. 重启 Dev Server 即可在左侧看到新模型。

参考：
- `provider-echo.js` 本地模拟，不需要网络
- `provider-openai.js` OpenAI 示例（浏览器直连仅用于演示，生产请走后端代理）
