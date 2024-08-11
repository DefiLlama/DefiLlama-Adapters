const ADDRESSES = require('../helper/coreAssets.json')
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
      usdc: ADDRESSES.ethereum.USDC,
      usdt: ADDRESSES.ethereum.USDT,
      DAI: ADDRESSES.ethereum.DAI,
      frax: ADDRESSES.ethereum.FRAX,
      fxs: ADDRESSES.ethereum.FXS,
      maker: ADDRESSES.ethereum.MKR,
      aave: ADDRESSES.ethereum.AAVE,
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
      busd: ADDRESSES.bsc.BUSD,
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
      return sumTokens2({ tokens: Object.values(tokens), owners, chain, block })
    }
  }
})

module.exports.ethereum.staking = staking('0xbf4c359C3C49aA243d0250863eB7B71997762083', '0xb57420fad6731b004309d5a0ec7c6c906adb8df7')