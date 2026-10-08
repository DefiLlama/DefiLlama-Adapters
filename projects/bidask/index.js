const { addTonBalances } = require('../helper/chain/ton')
const { sliceIntoChunks } = require('../helper/utils')
const { ton } = require('@defillama/sdk').chains

const FACTORY = 'EQAuBZGak9BdkxuCC9gWUsY4Em3jog94BI4eRzX-3_Bidask'
const DEPLOY_POOL_OP = '0xb814c41a'

// every pool is deployed by the factory via a message carrying state init
async function getPools() {
  const pools = new Set()
  const limit = 1000
  for (let offset = 0; ; offset += limit) {
    const { messages } = await ton.toncenterGet({ path: 'messages', params: { source: FACTORY, limit, offset, sort: 'asc' } })
    messages.filter(m => m.opcode === DEPLOY_POOL_OP && m.init_state).forEach(m => pools.add(m.destination))
    if (messages.length < limit) break
  }
  return [...pools]
}

module.exports = {
  methodology: 'Pools are discovered from deploy messages sent by the Bidask factory; TVL is the TON and jetton balances held by those pools.',
  timetravel: false,
  ton: {
    tvl: async (api) => {
      const pools = await getPools()
      await addTonBalances({ api, addresses: pools })
      for (const chunk of sliceIntoChunks(pools, 100)) {
        const wallets = await ton.getJettonWallets({ owner: chunk, excludeZeroBalance: true })
        wallets.forEach(({ jetton, balance }) => api.add(ton.normalizeAddress(jetton), balance))
      }
    }
  }
}
