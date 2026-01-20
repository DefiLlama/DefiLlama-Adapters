const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {

  polygon: {
    bridges: [
      '0x580F7C02ad1d8B7116B3424AB837B96F7b1ad597',
    ],
    tokens: {
      PYR: '0x430ef9263e76dae63c84292c3409d61c598e9682',
      CCO2: '0x82B37070e43C1BA0EA9e2283285b674eF7f1D4E2',
      WMATIC: ADDRESSES.polygon.WMATIC_2,
      WETH: ADDRESSES.polygon.WETH_1,
      USDT: ADDRESSES.polygon.USDT,
      MV: '0xA3c322Ad15218fBFAEd26bA7f616249f7705D945',
    }
  },
  ethereum: {
    bridges: [
      '0x314D915e947cc2907a704CeEDe7accf10Ea7dA6e',
    ],
    tokens: {
      PYR: '0x430ef9263e76dae63c84292c3409d61c598e9682',
      // CCO2: '0x82B37070e43C1BA0EA9e2283285b674eF7f1D4E2',
      // WMATIC: ADDRESSES.polygon.WMATIC_2,
      // WETH: ADDRESSES.polygon.WETH_1,
      // USDT: ADDRESSES.polygon.USDT,
      // MV: '0xA3c322Ad15218fBFAEd26bA7f616249f7705D945',
    }
  },
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: (_, _b, {[chain]: block }) => {
      const { bridges: owners, tokens } = config[chain]
      return sumTokens2({ tokens: Object.values(tokens), owners, chain, block })
    }
  }
})

