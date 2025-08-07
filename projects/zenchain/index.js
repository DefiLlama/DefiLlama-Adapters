const https = require('https')

const STORAGE_KEY_TOTAL_ISSUANCE = '0xc2261276cc9d1f8598ea4b6a74b15c2f57c875e4cff74148e4628f264b974c80'

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

async function staking(api) {
  const totalIssuanceHex = await querySubstrateStorage(STORAGE_KEY_TOTAL_ISSUANCE)
  const totalStaked = decodeU128(totalIssuanceHex)
  
  if (totalStaked !== '0') {
    api.addGasToken(totalStaked)
  }
  
  return api.getBalances()
}

module.exports = {
  methodology: "Tracks total ZTC issuance via direct Substrate RPC queries to the Balances pallet.",
  start: 1704067200,
  zenchain: {
    tvl: () => ({}),
    staking,
  },
}