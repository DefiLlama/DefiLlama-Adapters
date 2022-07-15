const abi = require('./abi')
const { getChainTransform } = require('../helper/portedTokens')
const { sumTokens } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const config = {
  fantom: {
    factories: [
      '0x35C052bBf8338b06351782A565aa9AaD173432eA', // Tarot Classic
      '0xF6D943c8904195d0f69Ba03D97c0BAF5bbdCd01B', // Tarot Requiem
      '0xbF76F858b42bb9B196A87E43235C2f0058CF7322', // Tarot Carcosa
    ]
  },
  optimism: {
    factories: [
      '0x1D90fDAc4DD30c3ba38d53f52A884F6e75d0989e', // Tarot Opaline
      '0xD7cABeF2c1fD77a31c5ba97C724B82d3e25fC83C', // Tarot Velours
    ]
  },
}

module.exports = {}

Object.keys(config).forEach(chain => {
  let tvlPromise
  const balances = {}
  const borrowedBalances = {}

  async function _getTvl(block) {
    const { factories } = config[chain]
    const transform = await getChainTransform(chain)
    const collaterals = []
    const borrowables = []
    for (const factory of factories) {
      const { output: allLendingPoolsLength } = await sdk.api.abi.call({
        target: factory,
        abi: abi.allLendingPoolsLength,
        chain, block,
      })

      const poolCalls = []
      for (let i = 0; i < +allLendingPoolsLength; i++)  poolCalls.push({ params: i })
      const { output: allLendingPools } = await sdk.api.abi.multiCall({
        target: factory,
        abi: abi.allLendingPools,
        calls: poolCalls,
        chain, block,
      })

      const calls2 = allLendingPools.map(i => ({ params: i.output }))

      const { output: getLendingPool } = await sdk.api.abi.multiCall({
        target: factory,
        abi: abi.getLendingPool,
        calls: calls2,
        chain, block,
      })

      getLendingPool.forEach(i => {
        collaterals.push(i.output.collateral)
        borrowables.push(i.output.borrowable0, i.output.borrowable1)
      })
    }

    const underlyingCalls = [...collaterals, ...borrowables].map(i => ({ target: i }))
    const { output: toaInput } = await sdk.api.abi.multiCall({
      abi: abi.underlying,
      calls: underlyingCalls,
      chain, block,
    })

    const underlyingMapping = {}

    const toa = toaInput.map(i => [i.output, i.input.target])
    toaInput.forEach(i => underlyingMapping[i.input.target] = i.output)
    const { output: borrowed } = await sdk.api.abi.multiCall({
      abi: abi.totalBorrows,
      calls: borrowables.map(i => ({ target: i })),
      chain, block,
    })

    borrowed.forEach(i => {
      sdk.util.sumSingleBalance(borrowedBalances, transform(underlyingMapping[i.input.target]), i.output)
    })

    await sumTokens(balances, toa, block, chain, transform, {
      resolveLP: true, blacklistedLPs: [
        '0x1f2bff0e37c592c7de6393c9dd3c0f7933408228', // disabled because _getReserves has a different abi compared to others
        '0x3fa4226faa9cc45c9b1317377ec450c58e54d2c1', // disabled because _getReserves has a different abi compared to others (it is "blockTimestampLast" instead of "_blockTimestampLast")
        '0x0fd2947895fcd9fd4fe5c66d255998c2d7e56ce6', // disabled because _getReserves has a different abi compared to others (it is "blockTimestampLast" instead of "_blockTimestampLast")
      ]
    })
    return { balances, borrowedBalances }
  }

  async function getTvl(block) {
    if (!tvlPromise) tvlPromise = _getTvl(block)
    return tvlPromise
  }

  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => (await getTvl(block)).balances,
    borrowed: async (_, _b, { [chain]: block }) => (await getTvl(block)).borrowedBalances,
  }
})
