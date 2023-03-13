const { getLogs } = require('../helper/cache/getLogs')

const helper = '0x07d2CeB4869DFE17e8D48c92A71eDC3AE564449f'
const config = {
  ethereum: {
    factory: '0xECb8Ffcb2369EF188A082a662F496126f66c8288',
    fromBlock: 16534507,
  }
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x5d9c31ffa0fecffd7cf379989a3c7af252f0335e0d2a1320b55245912c781f53'],
        eventAbi: 'event VaultCreated (address indexed manager, address indexed vault)',
        onlyArgs: true,
        fromBlock,
      })
      const vaults = logs.map(i => i.vault)
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