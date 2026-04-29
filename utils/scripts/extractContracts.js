const fs = require('fs')
const path = require('path')
const https = require('https')

const PROJECTS_DIR = path.join(__dirname, '../../projects')
const OUTPUT_FILE = path.join(__dirname, '../../contract-registry.json')

const ADDRESS_RE = /(?<![0-9a-fA-F])0x[a-fA-F0-9]{40}(?![0-9a-fA-F])/g
const ZERO_ADDR = '0x0000000000000000000000000000000000000000'
const GAS_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
const FETCH_TIMEOUT = 15000

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: FETCH_TIMEOUT }, res => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume()
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`))
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => { try { resolve(JSON.parse(data)) } catch (e) { reject(e) } })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout fetching ${url}`)) })
  })
}

async function buildExplorerMap() {
  const [llamaChains, chainidData] = await Promise.all([
    fetchJSON('https://api.llama.fi/v2/chains'),
    fetchJSON('https://chainid.network/chains.json'),
  ])

  const cidToInfo = {}
  for (const c of chainidData) {
    if (!c.explorers?.length) continue
    const exp = c.explorers[0]
    if (!exp.url) continue
    const baseUrl = exp.url.replace(/\/$/, '')
    const info = { pageUrl: baseUrl }

    if (baseUrl.includes('etherscan') || baseUrl.includes('scan.')) {
      const host = new URL(baseUrl).hostname
      info.apiUrl = `https://api.${host}/api`
      info.apiType = 'etherscan'
    } else if (baseUrl.includes('blockscout')) {
      info.apiUrl = `${baseUrl}/api`
      info.apiType = 'blockscout'
    }

    cidToInfo[c.chainId] = info
  }

  const chainMap = {}
  for (const c of llamaChains) {
    if (!c.chainId) continue
    const key = c.name.toLowerCase().replace(/\s+/g, '')
    const info = cidToInfo[c.chainId]
    chainMap[key] = { chainId: c.chainId, name: c.name, ...(info || { pageUrl: null }) }
  }

  const aliases = {
    eth: 'ethereum', bsc: 'bnbsmartchain', binance: 'bnbsmartchain',
    polygon: 'polygon', matic: 'polygon', avax: 'avalanche',
    optimism: 'opmainnet', fantom: 'fantomopera', xdai: 'gnosis',
    era: 'zksyncmainnet', zksync: 'zksyncmainnet',
    polygon_zkevm: 'polygonzkevm', arbitrum_nova: 'arbitrumnova',
    op_bnb: 'opbnbmainnet',
  }
  for (const [alias, target] of Object.entries(aliases)) {
    if (!chainMap[alias] && chainMap[target]) chainMap[alias] = chainMap[target]
  }

  return chainMap
}

const supportedChains = require(path.join(PROJECTS_DIR, 'helper/chains.json'))
const coreAssetsAddresses = new Set()
const coreAssets = require(path.join(PROJECTS_DIR, 'helper/coreAssets.json'))
for (const chain of Object.values(coreAssets)) {
  if (typeof chain === 'object') {
    for (const addr of Object.values(chain)) {
      if (typeof addr === 'string' && addr.startsWith('0x')) coreAssetsAddresses.add(addr.toLowerCase())
    }
  }
}

function extractByChain(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const result = {}

  const exportedChains = []
  for (const chain of supportedChains) {
    const re = new RegExp(`(?:^|[\\s{,])(?:["'])?${chain}(?:["'])?\\s*:\\s*(?:\\{|\\[|[a-zA-Z])`, 'm')
    if (re.test(content)) exportedChains.push(chain)
  }
  if (exportedChains.length === 0) return {}

  const lines = content.split('\n')
  let currentChain = null
  let depth = 0
  let chainLineIndex = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    for (const chain of exportedChains) {
      const re = new RegExp(`(?:^|[\\s{,])(?:["'])?${chain}(?:["'])?\\s*:\\s*(?:\\{|\\[)`, 'm')
      if (re.test(line)) {
        currentChain = chain
        chainLineIndex = i
        const opens = (line.match(/[{[]/g) || []).length
        const closes = (line.match(/[}\]]/g) || []).length
        depth = opens - closes
        break
      }
    }

    const addresses = line.match(ADDRESS_RE) || []
    for (const addr of addresses) {
      const lower = addr.toLowerCase()
      if (lower === ZERO_ADDR || lower === GAS_TOKEN) continue
      if (coreAssetsAddresses.has(lower)) continue

      const chain = currentChain || '_global'
      if (!result[chain]) result[chain] = new Set()
      result[chain].add(addr)
    }

    if (currentChain && i > chainLineIndex) {
      const opens = (line.match(/[{[]/g) || []).length
      const closes = (line.match(/[}\]]/g) || []).length
      depth += opens - closes
      if (depth <= 0) {
        currentChain = null
        depth = 0
      }
    }
  }

  if (result._global) delete result._global

  for (const [k, v] of Object.entries(result)) {
    result[k] = [...v]
  }
  return result
}

async function main() {
  const explorerMap = await buildExplorerMap()

  const withApi = Object.values(explorerMap).filter(e => e.apiUrl).length
  console.log(`Loaded ${Object.keys(explorerMap).length} chain explorers (${withApi} with API endpoints)`)

  const projectDirs = fs.readdirSync(PROJECTS_DIR).filter(d => {
    const full = path.join(PROJECTS_DIR, d)
    return fs.statSync(full).isDirectory() && d !== 'helper' && fs.existsSync(path.join(full, 'index.js'))
  })

  console.log(`Scanning ${projectDirs.length} adapters...\n`)

  const registry = {}
  let stats = { protocols: 0, contracts: 0, withExplorer: 0, withApi: 0 }

  for (const project of projectDirs) {
    const indexPath = path.join(PROJECTS_DIR, project, 'index.js')
    const byChain = extractByChain(indexPath)
    if (Object.keys(byChain).length === 0) continue

    const entry = {}
    for (const [chain, addresses] of Object.entries(byChain)) {
      const info = explorerMap[chain]
      entry[chain] = {
        chainId: info?.chainId || null,
        explorer: info?.pageUrl ? {
          pageUrl: info.pageUrl,
          apiUrl: info.apiUrl || null,
          apiType: info.apiType || null,
        } : null,
        contracts: addresses.map(addr => {
          const item = { address: addr }
          if (info?.pageUrl) item.url = `${info.pageUrl}/address/${addr}`
          return item
        })
      }
      stats.contracts += addresses.length
      if (info?.pageUrl) stats.withExplorer += addresses.length
      if (info?.apiUrl) stats.withApi += addresses.length
    }

    if (Object.keys(entry).length > 0) {
      registry[project] = entry
      stats.protocols++
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2))

  console.log(`Protocols: ${stats.protocols}`)
  console.log(`Contracts: ${stats.contracts}`)
  const pct = (n) => stats.contracts ? `${(n/stats.contracts*100).toFixed(0)}%` : '0%'
  console.log(`With explorer page: ${stats.withExplorer} (${pct(stats.withExplorer)})`)
  console.log(`With explorer API: ${stats.withApi} (${pct(stats.withApi)})`)
  console.log(`\nOutput: ${OUTPUT_FILE}`)

  console.log(`\nSample (aave-v3 ethereum):`)
  const sample = registry['aave-v3']?.ethereum
  if (sample) {
    console.log(`  Explorer API: ${sample.explorer?.apiUrl} (${sample.explorer?.apiType})`)
    console.log(`  Contracts: ${sample.contracts.length}`)
    console.log(`  ${sample.contracts[0].url}`)
  }

  console.log(`\nAPI usage example:`)
  console.log(`  Fetch verified source code:`)
  console.log(`  GET ${sample?.explorer?.apiUrl}?module=contract&action=getsourcecode&address=${sample?.contracts?.[0]?.address}`)
  console.log(`  Returns: SourceCode, ABI, ContractName, CompilerVersion, IsProxy, Implementation`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
