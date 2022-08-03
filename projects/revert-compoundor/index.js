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