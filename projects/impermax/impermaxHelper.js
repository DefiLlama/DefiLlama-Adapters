const abi = require('./abi')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')
const { nullAddress } = require('../helper/tokenMapping')

function impermaxHelper(exportsObj, config, blacklistedPools, { impermaxSymbol = 'STKD-UNI-V2' } = {}) {
  async function tvl(_, _b, _cb, { api, }) {
    const { factories } = config[api.chain]
    const blacklist = blacklistedPools[api.chain]
    const pools = []
    await Promise.all(factories.map(async (factory) => {
      const lendingPools = await api.fetchList({ lengthAbi: abi.allLendingPoolsLength, itemAbi: abi.allLendingPools, target: factory })

      // filter out blacklisted pools for the chain
      const filteredPoolData = lendingPools.filter(pool => {
        const poolAddress = pool.toLowerCase()
        return !blacklist.includes(poolAddress)
      })

      const poolData = await api.multiCall({
        target: factory,
        abi: abi.getLendingPool,
        calls: filteredPoolData,
      })

      poolData.forEach(i => {
        pools.push(i.collateral, i.borrowable0, i.borrowable1)
      })
    }))

    const underlyings = await api.multiCall({
      abi: abi.underlying,
      calls: pools,
    })

    const filteredUnderlyings = underlyings.filter(i => i !== nullAddress)
    const uSymbols = await api.multiCall({ abi: 'erc20:symbol', calls: filteredUnderlyings })
    const uvTokens = filteredUnderlyings.filter((_, i) => uSymbols[i] === impermaxSymbol)
    const [uToken, totalBalance] = await Promise.all([
      api.multiCall({ abi: 'address:underlying', calls: uvTokens }),
      api.multiCall({ abi: 'uint256:totalBalance', calls: uvTokens }),
    ])

    const toa = pools.map((v, i) => [underlyings[i], v])
    api.addTokens(uToken, totalBalance)

    return sumTokens2({
      api, tokensAndOwners: toa, resolveLP: true, blacklistedTokens: uvTokens,
    })
  }

  async function borrowed(_, _b, _cb, { api, }) {
    const { factories } = config[api.chain]
    const blacklist = blacklistedPools[api.chain]
    const balances = {}
    const borrowables = []
    await Promise.all(factories.map(async (factory) => {
      const lendingPools = await api.fetchList({ lengthAbi: abi.allLendingPoolsLength, itemAbi: abi.allLendingPools, target: factory })

      // filter out blacklisted pools for the chain
      const filteredPoolData = lendingPools.filter(pool => {
        const poolAddress = pool.toLowerCase()
        return !blacklist.includes(poolAddress)
      })

      const poolData = await api.multiCall({
        target: factory,
        abi: abi.getLendingPool,
        calls: lendingPools,
      })

      poolData.forEach(i => {
        borrowables.push(i.borrowable0, i.borrowable1)
      })
    }))

    const underlyings = await api.multiCall({
      abi: abi.underlying,
      calls: borrowables,
    })

    const borrowed = await api.multiCall({
      abi: abi.totalBorrows,
      calls: borrowables
    })

    underlyings.forEach((v, i) => {
      sdk.util.sumSingleBalance(balances, v, borrowed[i], api.chain)
    })
    return balances
  }

  Object.keys(config).forEach(chain => {
    exportsObj[chain] = { borrowed, tvl, }
  })
}

module.exports = {
  impermaxHelper
}