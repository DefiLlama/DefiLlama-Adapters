const ADDRESSES = require('../helper/coreAssets.json')

const ARB_DOUBLER_POOL1_CONTRACT = '0x56386f04111057a5D8DF8d719827038B716333F0';

const abi = "function getPool() view returns ((bool isNative, uint16 inputFee, uint16 withdrawFee, uint256 id, uint256 lastPrice, uint256 cLastRbTime, uint256 lowerOfInputMaximum, uint256 endPrice, uint256 startTime, uint256 lastDayRate, uint256 endTime, address asset, address cToken, address bToken, address creator))"

const config = {
  arbitrum: {
    pepe: '0x15AD6EDCa40dFAFE1B3BAc5F1c6d65411726F1bF',
    pool2: '0xC64a3f7da839F8851cB2A5710b693c92fA461027',
  },
  manta: {
    weth: '0xc8480647Eeb358df638Ca882362cE528cC666087',
    manta: '0x498F4711a706F9ad33b5D68EaA20E56a87d5d926',
  },
}

Object.keys(config).forEach(chain => {
  const pools = Object.values(config[chain])
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({ abi, calls: pools, })
      if (chain === 'arbitrum') {
        tokens.push({ asset: ADDRESSES.arbitrum.WETH })
        pools.push(ARB_DOUBLER_POOL1_CONTRACT)
      }
      return api.sumTokens({ tokensAndOwners2: [tokens.map(i => i.asset), pools] })
    }
  }
})