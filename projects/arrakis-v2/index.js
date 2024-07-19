const { getLogs } = require('../helper/cache/getLogs')

const helper = '0x07d2CeB4869DFE17e8D48c92A71eDC3AE564449f'
const config = {
  ethereum: {
    factory: '0xECb8Ffcb2369EF188A082a662F496126f66c8288',
    fromBlock: 16534507,
  },
  arbitrum: {
    factory: '0xECb8Ffcb2369EF188A082a662F496126f66c8288',
    fromBlock: 57173679,
  },
  optimism: {
    factory: '0xECb8Ffcb2369EF188A082a662F496126f66c8288',
    fromBlock: 71646573,
  },
  polygon: {
    factory: '0xECb8Ffcb2369EF188A082a662F496126f66c8288',
    fromBlock: 38788368,
  }
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const numVaults = await api.call({ abi: 'uint256:numVaults', target: factory })
      const vaults = await api.call({ abi: 'function vaults(uint256 startIndex_, uint256 endIndex_) returns (address[] memory)', target: factory, params:[0, numVaults] })
      const [token0s, token1s, bals ] = await Promise.all([
        api.multiCall({  abi: 'address:token0', calls: vaults }),
        api.multiCall({  abi: 'address:token1', calls: vaults }),
        api.multiCall({  abi: 'function totalUnderlying(address) view returns (uint256, uint256)', target: helper, calls: vaults }),
      ])

      bals.forEach(([v0, v1], i) => {
        api.add(token0s[i],v0)
        api.add(token1s[i],v1)
      })
    }
  }
})