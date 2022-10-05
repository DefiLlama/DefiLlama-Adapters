const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')
const { staking} = require('../helper/staking')

// data taken from https://github.com/dotoracle/bridge-contracts/tree/master/deployments
const config = {
  ethereum: {
    bridges: [
      '0x02b758ce469af940C57A42aD1dE5D404122bc283',
    ],
    tokens: {
      eth: nullAddress,
      usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      usdt: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
      frax: '0x853d955acef822db058eb8505911ed77f175b99e',
      fxs: '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0',
      maker: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      aave: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    }
  },
  avax: {
    bridges: [
      '0x328A523B71545ddE8CD12a685318F2777D68798D',
    ],
    tokens: {
      avax: nullAddress,
      ptp: '0x22d4002028f537599be9f666d1c4fa138522f9c8',
    }
  },
  bsc: {
    bridges: [
      '0x328A523B71545ddE8CD12a685318F2777D68798D',
    ],
    tokens: {
      bsc: nullAddress,
      busd: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    }
  },
  okexchain: {
    bridges: [
      '0x328A523B71545ddE8CD12a685318F2777D68798D',
    ],
    tokens: {
      okt: nullAddress,
    }
  },
  moonbeam: {
    bridges: [
      '0x328A523B71545ddE8CD12a685318F2777D68798D',
    ],
    tokens: {
      glmr: nullAddress,
    }
  },
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: (_, _b, {[chain]: block}) => {
      const { bridges: owners, tokens } = config[chain]
      return sumTokens2({ tokens: Object.values(tokens), owners, chain, block, })
    }
  }
})

module.exports.ethereum.staking = staking('0xbf4c359C3C49aA243d0250863eB7B71997762083', '0xb57420fad6731b004309d5a0ec7c6c906adb8df7')