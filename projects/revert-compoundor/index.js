const { unwrapUniswapV3NFTs } = require('../helper/unwrapLPs')

const config = {
  ethereum: {
    owners: ['0x5411894842e610C4D0F6Ed4C232DA689400f94A1'],
  },
  polygon: {
    owners: ['0x5411894842e610C4D0F6Ed4C232DA689400f94A1'],
  },
  arbitrum: {
    owners: ['0x5411894842e610C4D0F6Ed4C232DA689400f94A1'],
  },
  optimism: {
    owners: ['0x5411894842e610C4D0F6Ed4C232DA689400f94A1'],
  },
  bsc: {
    owners: ['0x98eC492942090364AC0736Ef1A741AE6C92ec790']
  }
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: (_, _b, { [chain]: block }) => {
      const { owners } = config[chain]
      return unwrapUniswapV3NFTs({ chain, block, owners, })
    }
  }
})