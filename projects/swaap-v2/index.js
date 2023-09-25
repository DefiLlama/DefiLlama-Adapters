const { getLogs } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0x03C01Acae3D0173a93d819efDc832C7C4F153B06', fromBlock: 17598603, },
  polygon: { factory: '0x03C01Acae3D0173a93d819efDc832C7C4F153B06', fromBlock: 44521619, },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x83a48fbcfc991335314e74d0496aab6a1987e992ddc85dddbcc4d6dd6ef2e9fc'],
        eventAbi: 'event PoolCreated (address indexed pool)',
        onlyArgs: true,
        fromBlock,
      })
      const pools = logs.map(log => log.pool)
      const vault = await api.call({ abi: 'address:getVault', target: factory })
      const poolIds = await api.multiCall({ abi: 'function getPoolId() view returns (bytes32)', calls: pools })
      const data = await api.multiCall({ abi: 'function getPoolTokens(bytes32) view returns (address[] tokens, uint256[] balances,  uint256 lastChangeBlock)', calls: poolIds, target: vault })
      data.forEach(({ tokens, balances }) => api.addTokens(tokens, balances))
    }
  }
})