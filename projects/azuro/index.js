const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  xdai: {
    factory: '0xd1025891129f02f0e66d5126fc73e52aecb918c3',
    fromBlock: 39725854,
    tokensAndOwners: [
      [ADDRESSES.xdai.WXDAI, '0xac004b512c33D029cf23ABf04513f1f380B3FD0a'], // v1
      [ADDRESSES.xdai.WXDAI, '0x8ea1a7241537f10fa73363fdc6380f3fc8619c03']  // v2
    ],  
  },
  polygon: { 
    factory: '0x4a6a41bfb53f5413ecd2203636101cf8bd25dbc2', 
    fromBlock: 70690976, 
    tokensAndOwners: [
      [ADDRESSES.polygon.USDT, '0xde3e9a39af548b5daa8365d30a5f6e7a7fa0203d'] // v2
    ],
  },
  chz: { 
    factory: '0x0cdad6856c8b804b63257c1eb9b3e74d234d8f67', 
    fromBlock: 22928402, 
    tokensAndOwners: [
      [ADDRESSES.chz.WCHZ, '0xc57dc3acf7834d0dc4b2f73a5fb81dd9609d347a'] // v2
    ],
  },
  base: { 
    factory: '0x3d59f8f50354e3c0badfc980ad3b7a0193881610', 
    fromBlock: 29359824, 
    tokensAndOwners: [
      [ADDRESSES.base.WETH, '0xe9f7e1fdf377a29eea01b23e379bf3f1f3ee8537'] // v2
    ],
  },
}

async function tvl(api) {
  return sumTokens2({ api, ...config[api.chain] })
}

module.exports = {
  xdai: { tvl },
  polygon: { tvl },
  chz: { tvl },
  base: { tvl },
  methodology: `TVL is the total amount of WXDAI, WETH, USDT and CHZ held on Liquidity pools’ smart-contracts.`
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, tokensAndOwners = [] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xbf48d8b8335478e764061b936181c0a7b273540bd6284da4d4791758e81fd51c'],
        eventAbi: 'event NewPool(address indexed lp, address indexed core, string indexed coreType, address access, address vault, address token, address azuroBet)',
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
