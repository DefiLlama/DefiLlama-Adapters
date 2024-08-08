const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');

const BridgeAddr = '0x623777Cc098C6058a46cF7530f45150ff6a8459D'

const config = {
  taiko: {tokens: [ADDRESSES.null] },
  arbitrum: {tokens: [ADDRESSES.null] },
  base: {tokens: [ADDRESSES.null]},
  linea: {tokens: [ADDRESSES.null]},
  scroll: {tokens: [ADDRESSES.null]},
  zklink: {tokens: [ADDRESSES.null]},
  bsc: {tokens: [ADDRESSES.bsc.ETH]},
  ethereum: {tokens: [ADDRESSES.null]},
  optimism: { tokens: [ADDRESSES.null]},
  era: {tokens: [ADDRESSES.null]},
  blast:{tokens: [ADDRESSES.null]},
  kroma:{tokens: [ADDRESSES.null]},
  mint:{tokens: [ADDRESSES.null]},
  zora: {tokens: [ADDRESSES.null]},
    // alienx:{tokens: [ADDRESSES.null]},
}

Object.keys(config).forEach(chain => {
  const {owner = BridgeAddr, tokens, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      if (tokens) ownerTokens.push([tokens, owner])
      return sumTokens2({ api, ownerTokens })
    }
  }
})