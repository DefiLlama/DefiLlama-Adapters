const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  polygon: { factory: '0xde3e9a39af548b5daa8365d30a5f6e7a7fa0203d', fromBlock: 38563568, },
  arbitrum: { factory: '0x752735c1a93fe359e7bac65f9981e7796e1039ef', fromBlock: 94336607, },
  xdai: {
    factory: '0x8ea1a7241537f10fa73363fdc6380f3fc8619c03', fromBlock: 26026402, tokensAndOwners: [[ADDRESSES.xdai.WXDAI, '0xac004b512c33D029cf23ABf04513f1f380B3FD0a']],  // v1
  },
}

async function tvl(api) {
  return sumTokens2({ api, ...config[api.chain] })
}

module.exports = {
  xdai: { tvl },
  polygon: { tvl },
  methodology: `TVL is the total amount of WXDAI and USDC held on Liquidity pools’ smart-contracts.`
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, tokensAndOwners = [] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xbf48d8b8335478e764061b936181c0a7b273540bd6284da4d4791758e81fd51c'],
        eventAbi: 'event NewPool(address indexed lp, address indexed core, string indexed coreType, address access)',
        onlyArgs: true,
        fromBlock,
      })
      const lps = logs.map(i => i[0])
      const tokens = await api.multiCall({ abi: 'address:token', calls: lps })
      lps.forEach((lp, i) => tokensAndOwners.push([tokens[i], lp]))
      return sumTokens2({ api, tokensAndOwners, permitFailure: true })
    }
  }
})