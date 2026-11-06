const { post } = require('../http')
const { sleep } = require('../utils')

const RPC = 'https://mainnet1.neo.coz.io:443'

async function getNep17Balances(address) {
  const { result } = await post(RPC, { jsonrpc: '2.0', id: 1, method: 'getnep17balances', params: [address] })
  return result?.balance ?? []
}

// NEP-17 balances are added raw under `neo:<asset hash>`: the coins server knows the chain as `neo`, not `neo3`,
// and holds the decimals/pricing for NEO, GAS, ...
async function sumTokens({ api, owners = [] }) {
  for (const owner of owners) {
    const balances = await getNep17Balances(owner)
    for (const { assethash, amount } of balances)
      api.add(`neo:${assethash.toLowerCase()}`, amount, { skipChain: true })
    await sleep(200)
  }
}

module.exports = {
  getNep17Balances,
  sumTokens,
}
