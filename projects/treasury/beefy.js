const { getConfig } = require('../helper/cache')
const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const chains = [
  "fuse",
  "celo",
  "moonbeam",
  "aurora",
  "harmony",
  "ethereum",
  "syscoin",
  "metis",
  "heco",
  "moonriver",
  "arbitrum",
  "kava",
  "oasis",
  "cronos",
  "optimism",
  "fantom",
  "bsc",
  "polygon",
  "avax",
  "canto"
]

const chainMap = {
  harmony: 'one',
  syscoin: 'sys',
  oasis: 'emerald',
}

const getKey = c => chainMap[c] || c

let config

async function _getConfig() {
  if (!config) config = getConfig('beefy/treasury', 'https://api.beefy.finance/treasury')
  return config
}

module.exports = {
};

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const balances = {}
      let data = (await _getConfig())[getKey(chain)] || {}
      const uniV3Owners = []
      const ownerTokens = Object.entries(data)
        .filter(i => {
          if (i[0] !== 'validator') return true
          api.add(nullAddress, i[1].balances.validator.balance)
        })
        .map(([owner, { balances }]) => {

          const tokens = Object.entries(balances).filter(([_, info]) => info.name !== 'BIFI').map(i => i[0] === 'native' ? nullAddress : i[0])
          if (Object.keys(balances).some(i => i.toLowerCase() === '0x8e295789c9465487074a65b1ae9ce0351172393f'))
            uniV3Owners.push(owner)

          return [tokens, owner]
        })
      if (uniV3Owners.length) await sumTokens2({ api, owners: uniV3Owners, resolveUniV3: true, })
      return sumTokens2({ balances, api, ownerTokens, blacklistedTokens: ['0x8e295789c9465487074a65b1ae9ce0351172393f'], })
    },
    ownTokens: async (_, _b, _cb, { api, }) => {
      let BIFI
      let data = (await _getConfig())[getKey(chain)] || {}
      const owners = []
      Object.entries(data).filter(i => i[0] !== 'validator')
        .map(([owner, { balances }]) => {
          Object.entries(balances).some(([_, info]) => {
            if (info.name !== 'BIFI') return false
            BIFI = info.address
            owners.push(owner)
          })
        })
      if (!BIFI) return {}
      return sumTokens2({ api, tokens: [BIFI], owners, blacklistedTokens: ['0x8e295789c9465487074a65b1ae9ce0351172393f'], })
    },
  }
})