const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  arbitrum: {
    stakingContract: '0x18a192dFe0BE1E5E9AA424738FdAd800646283b2',
  },
  bsc: {
    stakingContract: '0xe05157aA8D14b8ED1d816D505b3D5DEEB83ca131',
  }
}

Object.keys(config).forEach(chain => {
  const { stakingContract, DLP, LP } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const poolHelper = await api.call({  abi: 'address:assetLoopHelper', target: stakingContract })
      const mfd = await api.call({  abi: 'address:multiFeeDistributor', target: stakingContract })
      const LP = await api.call({  abi: 'address:rdntWethLp', target: stakingContract })
      const tokens = await api.fetchList({  lengthAbi: 'uint256:poolLength', itemAbi: 'function poolTokenList(uint256) view returns (address)', target: stakingContract})
      const bals = await api.multiCall({  abi: 'function totalStaked(address) view returns (uint256)', calls:tokens, target: poolHelper })
      const lpBal = await api.call({  abi: 'function totalBalance(address) view returns (uint256)', target:mfd, params: stakingContract })

      api.addTokens(tokens, bals)
      api.add(LP, lpBal)

      await api.sumTokens({ owner: stakingContract, tokens: [LP]})
      return sumTokens2({ api, resolveLP: true, })
    }
  }
})