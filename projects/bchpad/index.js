const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const chain = "smartbch"

// token contracts
const BPAD = "0x9192940099fDB2338B928DE2cad9Cd1525fEa881"
const CATS = ADDRESSES.smartbch._CATS

// tvl pools
const BPAD_POOL = "0xc39f046a0E2d081e2D01558269D1e3720D2D2EA1" // BPAD single asset pool, ended
const CATS_POOL = "0x9F8a513C11c278dfF624678108B41310fA0398E3" // CATS single asset pool, ended

// tvl pairs
const BPAD_WBCH_PAIR = "0x8221d04a71fcd0dd3d096cb3b49e22918095933f"

module.exports = {
  methodology: "BCHPad uses LP pools created on other dexes and single asset pools of non-native tokens for their liquidity mining, these pools are used for TVL calculation.",
  smartbch: {
    tvl: async (api) => {
      return sumTokens2({ api, tokensAndOwners: [
        [CATS, CATS_POOL],
      ]})
    },
    pool2: async (api) => {
      return sumTokens2({ api, tokensAndOwners: [
        [BPAD_WBCH_PAIR, '0x87DfAE804cF62A1FcafA4395346f3c6331E1032b'],
      ], resolveLP: true, })
    },
    staking: async (api) => {
      return sumTokens2({ api, tokensAndOwners: [
        [BPAD, BPAD_POOL],
      ], })
    }
  },
}
