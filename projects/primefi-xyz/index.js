const { staking } = require("../helper/staking");
const { aaveExports, methodology, aaveV2Export, } = require("../helper/aave");
const { mergeExports } = require('../helper/utils');

const coreMarkets = {
  methodology,
  base: {
    ...aaveExports(undefined, '0xBfeE735e3868f8990787CCEAA4B920C9Ed162b07'),
    pool2: staking("0x5b6D95545750f1bb1812F5c564d9a401D3DeBd80", "0x87B417AF600312df37F551a05ae14bCC3d55bC36")
  },
  hyperliquid: {
    ...aaveExports(undefined, '0x69A3c30A85aA1E22791466a08819c1080f0Aab7f'),
    pool2: staking("0x33cd734739c6DeD500fD080d476D93135cB813Ef", "0x981F145a71Da6DF4A7cBe892807782c9CC9a5515")
  },
  xdc: {
    ...aaveExports(undefined, '0xBfeE735e3868f8990787CCEAA4B920C9Ed162b07'),
    pool2: staking("0x01E7cd81D3d7A4907815877e0C937a77dE537e99", "0xffA04F091128fb89D3B1eCd0149DC677dfAe1C69")
  },
};

const primeMarketsConfig = {
  base: [
    '0x8a619D8E3BfAb54F7C30Ef39Ce16c53429c739C3',
  ],
  hyperliquid: [
    '0xb339448E13E273f6F46e3390e0932Ab7fF9F113F',
  ],
  xdc: [
    '0x8a619D8E3BfAb54F7C30Ef39Ce16c53429c739C3',
  ],
}
const primeMarketExports = {}

Object.keys(primeMarketsConfig).forEach(chain => {
  const pools = primeMarketsConfig[chain]
  primeMarketExports[chain] = {
    tvl: async (api) => {
      for (const pool of pools) {
        await aaveV2Export(pool).tvl(api)
      }
      return api.getBalances()
    },
    borrowed: async (api) => {
      for (const pool of pools) {
        await aaveV2Export(pool).borrowed(api)
      }
      return api.getBalances()
    }
  }
})

module.exports = mergeExports([primeMarketExports, coreMarkets])