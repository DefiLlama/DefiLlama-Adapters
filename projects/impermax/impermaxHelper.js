const abi = require('./abi')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')
const { nullAddress } = require('../helper/tokenMapping')

function impermaxHelper(exportsObj, config, blacklistedPools) {
  async function tvl(api) {
    const { factories } = config[api.chain]
    const blacklist = blacklistedPools[api.chain]
    const pools = []
    await Promise.all(factories.map(async (factory) => {
      const lendingPools = await api.fetchList({ lengthAbi: abi.allLendingPoolsLength, itemAbi: abi.allLendingPools, target: factory })
      const filteredPools = lendingPools.filter(pool => !blacklist.includes(pool.toLowerCase()))

      const poolData = await api.multiCall({
        chain: api.chain,
        target: factory,
        abi: abi.getLendingPool,
        calls: filteredPools,
        permitFailure: true,
      })

      const initialiazedPools = poolData.filter(pool => pool.initialized)
      initialiazedPools.forEach(i => {
        pools.push(i.collateral, i.borrowable0, i.borrowable1)
      })
    }))

    const underlyings = await api.multiCall({
      abi: abi.underlying,
      calls: pools,
      permitFailure: true,
    })

    const filteredUnderlyings = underlyings.filter(i => i !== nullAddress)
    const uSymbols = await api.multiCall({ abi: 'erc20:symbol', calls: filteredUnderlyings })

    const uvTokens = await getUVTokens(pools, filteredUnderlyings, uSymbols, api)

    const [uToken, totalBalance] = await getUnderlyingPoolsInfo(uvTokens, api)

    const toa = pools.map((v, i) => [underlyings[i], v])
    api.addTokens(uToken, totalBalance)

    return sumTokens2({
      api, tokensAndOwners: toa, resolveLP: true, blacklistedTokens: uvTokens, permitFailure: true,
    })
  }

  async function borrowed(api) {
    const { factories } = config[api.chain]
    const blacklist = blacklistedPools[api.chain]
    const balances = {}
    const borrowables = []
    await Promise.all(factories.map(async (factory) => {
      const lendingPools = await api.fetchList({ lengthAbi: abi.allLendingPoolsLength, itemAbi: abi.allLendingPools, target: factory })

      // filter out blacklisted pools for the chain
      const filteredPoolData = lendingPools.filter(pool => {
        return !blacklist.includes(pool.toLowerCase())
      })

      const poolData = await api.multiCall({
        target: factory,
        abi: abi.getLendingPool,
        calls: filteredPoolData,
        permitFailure: true,
      })

      poolData.forEach(i => {
        borrowables.push(i.borrowable0, i.borrowable1)
      })
    }))

    const underlyings = await api.multiCall({
      abi: abi.underlying,
      calls: borrowables,
      permitFailure: true,
    })

    const borrowed = await api.multiCall({
      abi: abi.totalBorrows,
      calls: borrowables,
      permitFailure: true,
    })

    underlyings.forEach((v, i) => {
      sdk.util.sumSingleBalance(balances, v, borrowed[i], api.chain)
    })
    return balances
  }

  async function getUVTokens(rawPools, underlyings, uSymbols, api) {
    var impermaxSymbol;
    switch (api.chain) {
      case 'ethereum':
        impermaxSymbol = 'UNI-V2'
        return rawPools.filter((_, i) => uSymbols[i] === impermaxSymbol)

      case 'polygon':
      case 'arbitrum':
      case 'avax':
      case 'moonriver':
      case 'canto':
      case 'era':
      case 'fantom':
      default:
        impermaxSymbol = 'STKD-UNI-V2'
        return underlyings.filter((_, i) => uSymbols[i] === impermaxSymbol)
    }
  }

  async function getUnderlyingPoolsInfo(uvTokens, api) {
    return Promise.all([
      api.multiCall({ abi: 'address:underlying', calls: uvTokens, permitFailure: true }),
      api.multiCall({ abi: 'uint256:totalBalance', calls: uvTokens, permitFailure: true }),
    ])
  }

  Object.keys(config).forEach(chain => {
    exportsObj[chain] = { borrowed, tvl, }
  })
}

module.exports = {
  impermaxHelper
}