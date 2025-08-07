const https = require('https')

// Substrate storage keys for staking data
const STORAGE_KEYS = {
  // Staking.ErasTotalStake for current era  
  erasTotalStakePrefix: '0x5f3e4907f716ac89b6347d15ececedca87a42226fbe19e1c774fa0a564a9e182',
  // Staking.CurrentEra
  currentEra: '0x5f3e4907f716ac89b6347d15ececedca487df464e44a534ba6b0cbb32407b587',
}

async function querySubstrateStorage(key) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: 'state_getStorage',
      params: [key],
      id: 1
    })
    
    const options = {
      hostname: 'zenchain-testnet.api.onfinality.io',
      path: '/public',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          resolve(result?.result || null)
        } catch {
          resolve(null)
        }
      })
    })
    
    req.on('error', () => resolve(null))
    req.write(postData)
    req.end()
  })
}

function decodeU128(hex) {
  if (!hex || hex === '0x') return '0'
  const bytes = hex.slice(2)
  if (bytes.length >= 32) {
    const u128Hex = bytes.slice(0, 32)
    const reversed = u128Hex.match(/.{2}/g).reverse().join('')
    return BigInt('0x' + reversed).toString()
  }
  return '0'
}

function decodeU32(hex) {
  if (!hex || hex === '0x') return 0
  const bytes = hex.slice(2)
  if (bytes.length >= 8) {
    const u32Hex = bytes.slice(0, 8)
    const reversed = u32Hex.match(/.{2}/g).reverse().join('')
    return parseInt('0x' + reversed, 16)
  }
  return 0
}

async function staking(api) {
  // Get current era
  const currentEraHex = await querySubstrateStorage(STORAGE_KEYS.currentEra)
  const currentEra = decodeU32(currentEraHex)
  
  if (currentEra > 0) {
    // Build storage key for current era total stake
    const eraBytes = currentEra.toString(16).padStart(8, '0')
    const eraKey = STORAGE_KEYS.erasTotalStakePrefix + eraBytes
    
    // Get total staked amount for current era
    const totalStakedHex = await querySubstrateStorage(eraKey)
    const totalStaked = decodeU128(totalStakedHex)
    
    if (totalStaked !== '0') {
      api.addGasToken(totalStaked)
    }
  }
  
  return api.getBalances()
}

async function tvl(api) {
  // TODO: Add tracking for:
  // 1. Cross-chain bridged assets (when bridges are deployed)
  // 2. DEX liquidity pools (when DEX is deployed) 
  // 3. Lending protocol deposits (when lending protocols are deployed)
  // 4. NFT collateral values (when NFT-Fi is deployed)
  
  // Currently no TVL outside of staking on testnet
  return api.getBalances()
}

module.exports = {
  methodology: "Tracks ZTC tokens actually staked by validators and nominators in the current era via Substrate storage queries. Additional DeFi protocols will be tracked when deployed. Currently tracking testnet data.",
  start: 1704067200,
  zenchain: { // Testnet
    tvl,
    staking,
  },
  // zenchain_mainnet: {  // Ready for mainnet launch
  //   tvl,
  //   staking,
  // },
}