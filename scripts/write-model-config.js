// Usage:
// node scripts/write-model-config.js '{"deepseek":{"apiKey":"xxx"},"doubao":{"apiKey":"yyy"}}'
// This script will write src/config/model.yaml containing the providers and apiKey values.

const fs = require('fs')
const path = require('path')

function toYAML(obj, indent = 0) {
  const pad = ' '.repeat(indent)
  if (obj === null) return 'null'
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj)
  }
  if (Array.isArray(obj)) {
    return obj.map(i => `${pad}- ${toYAML(i, indent + 2)}`).join('\n')
  }
  // object
  return Object.entries(obj)
    .map(([k, v]) => {
      if (v === null) return `${pad}${k}: null`
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return `${pad}${k}: ${v}`
      // nested
      return `${pad}${k}:\n${toYAML(v, indent + 2)}`
    })
    .join('\n')
}

function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error('Please pass JSON string as first argument')
    process.exit(2)
  }

  let data
  try {
    data = JSON.parse(arg)
  } catch (e) {
    console.error('Invalid JSON:', e.message)
    process.exit(2)
  }

  const yaml = toYAML(data)
  const outDir = path.resolve(__dirname, '../src/config')
  const outFile = path.join(outDir, 'model.yaml')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(outFile, yaml, 'utf8')
  console.log('Wrote', outFile)
}

main()
