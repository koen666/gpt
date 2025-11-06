// Simple local server to accept providerSecrets JSON and write src/config/model.yaml
// Usage: node scripts/save-config-server.js

const express = require('express')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')

function toYAML(obj, indent = 0) {
  const pad = ' '.repeat(indent)
  if (obj === null) return 'null'
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj)
  }
  if (Array.isArray(obj)) {
    return obj.map(i => `${pad}- ${toYAML(i, indent + 2)}`).join('\n')
  }
  return Object.entries(obj)
    .map(([k, v]) => {
      if (v === null) return `${pad}${k}: null`
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return `${pad}${k}: "${String(v).replace(/"/g, '\\"')}"`
      return `${pad}${k}:\n${toYAML(v, indent + 2)}`
    })
    .join('\n')
}

const app = express()
app.use(bodyParser.json({ limit: '1mb' }))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.post('/save-config', (req, res) => {
  try {
    const providerSecrets = req.body.providerSecrets || req.body || {}
    const data = {}
    // ensure we have flat structure
    Object.keys(providerSecrets).forEach(k => {
      const entry = providerSecrets[k] || {}
      data[k] = { apiKey: entry.apiKey || '' }
    })

    const yaml = toYAML(data)
    const outDir = path.resolve(__dirname, '../src/config')
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
    const outFile = path.join(outDir, 'model.yaml')
    fs.writeFileSync(outFile, yaml, 'utf8')
    res.json({ ok: true, path: outFile })
  } catch (e) {
    console.error('Failed to save config', e)
    res.status(500).json({ ok: false, error: e.message })
  }
})

const PORT = process.env.CONFIG_PORT || 4001
app.listen(PORT, () => console.log(`Config writer listening on http://localhost:${PORT}/save-config`))
