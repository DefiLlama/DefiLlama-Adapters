const { post } = require('../http')
const { sleep } = require('../utils')

const RPC = 'https://mainnet1.neo.coz.io:443'

// NEP-17 asset hash -> pricing; anything else the wallet holds is skipped (FLM has no price feed)
const ASSETS = {
  '0xef4073a0f2b305a38ec4050e4d3d28bc40ea63f5': { geckoId: 'neo', decimals: 0 },
  '0xd2a4cff31913016155e38e474a2c06d08be276cf': { geckoId: 'gas', decimals: 8 },
}

async function getNep17Balances(address) {
  const { result } = await post(RPC, { jsonrpc: '2.0', id: 1, method: 'getnep17balances', params: [address] })
  return result?.balance ?? []
}

async function sumTokens({ api, owners = [] }) {
  for (const owner of owners) {
    const balances = await getNep17Balances(owner)
    for (const { assethash, amount } of balances) {
      const asset = ASSETS[assethash.toLowerCase()]
      if (!asset) continue
      api.addCGToken(asset.geckoId, Number(amount) / 10 ** asset.decimals)
    }
    await sleep(200)
  }
}

module.exports = {
  getNep17Balances,
  sumTokens,
}
