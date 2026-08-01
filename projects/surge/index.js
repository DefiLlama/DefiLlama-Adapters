const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  arbitrum: { factory: '0x503A14768e23456620fB3Cb61e37A36A2736Cbd0', fromBlock: 107875529, }
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  const _getLogs = (api) => getLogs({
    api,
    target: factory,
    topics: ['0xfd4f84c703fbc9ed47d26b2769a6133a02ea690b88125c716c7321699d0115fa'],
    eventAbi: 'event PoolDeployed(uint256 poolId, address pool, address indexed collateralToken, address indexed loanToken, uint256 indexed maxCollateralRatioMantissa, uint256 surgeMantissa, uint256 collateralRatioFallDuration, uint256 collateralRatioRecoveryDuration, uint256 minRateMantissa, uint256 surgeRateMantissa, uint256 maxRateMantissa)',
    onlyArgs: true,
    fromBlock,
  })
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await _getLogs(api)
      const ownerTokens = logs.map(l => [[l.collateralToken, l.loanToken], l.pool])
      return sumTokens2({ api, ownerTokens, })
    },
    borrowed: async (api) => {
      const logs = await _getLogs(api)
      const borrowed = await api.multiCall({  abi: 'uint256:lastTotalDebt', calls: logs.map(i => i.pool) })
      api.addTokens(logs.map(i => i.loanToken), borrowed)
      return api.getBalances()
    },
  }
})