const abi = require('./abi')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')
const { nullAddress } = require('../helper/tokenMapping')

function tarotHelper(exportsObj, config, { tarotSymbol = 'vTAROT' } = {}) {
  async function tvl(api) {
    const { factories } = config[api.chain]
    const pools = []
    await Promise.all(factories.map(async (factory) => {
      const lendingPools = await api.fetchList({ lengthAbi: abi.allLendingPoolsLength, itemAbi: abi.allLendingPools, target: factory })

      const poolData = await api.multiCall({
        target: factory,
        abi: abi.getLendingPool,
        calls: lendingPools,
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
    const uvTokens = filteredUnderlyings.filter((_, i) => uSymbols[i] === tarotSymbol)
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

  async function borrowed(api) {
    const { factories } = config[api.chain]
    const balances = {}
    const borrowables = []
    await Promise.all(factories.map(async (factory) => {
      const lendingPools = await api.fetchList({ lengthAbi: abi.allLendingPoolsLength, itemAbi: abi.allLendingPools, target: factory })

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

    // think these have lot of bad debt
    const blacklistedBorrowables = new Set([
      '0x5990Ddc40b63D90d3B783207069F5b9A8b661C1C',
    ].map(a => a.toLowerCase()))

    underlyings.forEach((v, i) => {
      // Lot of MAI pools have bad debt, ignoring it
      if (v.toLowerCase() !== '0xfb98b335551a418cd0737375a2ea0ded62ea213b' && !blacklistedBorrowables.has(borrowables[i].toLowerCase())) {
        sdk.util.sumSingleBalance(balances, v, borrowed[i], api.chain)
      }
    })
    return balances
  }

  Object.keys(config).forEach(chain => {
    exportsObj[chain] = { borrowed, tvl, }
  })
}

module.exports = {
  tarotHelper
}