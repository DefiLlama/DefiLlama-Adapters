
const token0ABI = 'address:token0'
const token1ABI = 'address:token1'

const abis = {
  poolsCount: "uint256:poolsCount",
  poolsAddresses: "function poolsAddresses(uint256) view returns (address)",
}

const config = {
  kava: {
    positionManager: '0x1Bf12f0650d8065fFCE3Cd9111feDEC21deF6825',
  },
  aurora: {
    positionManager: '0x649Da64F6d4F2079156e13b38E95ffBF8EBB1B14',
  },
  polygon: {
    positionManager: '0xc130807A61D5fE62F2cE3A38B14c61D658CE73F3',
  },
  bsc: {
    positionManager: '0x4eDeDaDFc96E44570b627bbB5c169d91304cF417',
  },
  dchainmainnet: {
    positionManager: '0x2f811854d65B8C0Cf6DC326F3b8E3A34B55DC1E2',
  },
}

Object.keys(config).forEach(chain => {
  const { positionManager } = config[chain]
  module.exports[chain] = {
    tvl: async function tvl(api) {
      const pools = await api.fetchList({  lengthAbi: abis.poolsCount, itemAbi: abis.poolsAddresses, target: positionManager})
      const token0s = await api.multiCall({  abi: token0ABI, calls: pools})
      const token1s = await api.multiCall({  abi: token1ABI, calls: pools})
      const ownerTokens = []
      pools.forEach((pool, i) => ownerTokens.push([[token0s[i], token1s[i]], pool]))
      return api.sumTokens({ ownerTokens })
    }
  }
})
