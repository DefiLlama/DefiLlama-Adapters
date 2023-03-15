const abi = require('./abi')
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

function tarotHelper(exportsObj, config) {
  async function tvl(_, _b, _cb, { api, }) {
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
    const toa = pools.map((v, i) => [underlyings[i], v])
    return sumTokens2({
      api, tokensAndOwners: toa, resolveLP: true, blacklistedLPs: [
        '0xa5c76fe460128936229f80f651b1deafa37583ae', // evolve in cronos
        // '0x1f2bff0e37c592c7de6393c9dd3c0f7933408228', // disabled because _getReserves has a different abi compared to others
        '0x357c1b507ef563d342afecd01001f1c0b525e25b', // disabled Error: Returned error: execution reverted: VaultToken: INSUFFICIENT_RESERVES
        // '0x526b38991627c509a570ac18a46f7ac7aabc7e4a', // disabled Error: Returned error: execution reverted: VaultToken: INSUFFICIENT_RESERVES
        '0x8706dc2067d64651620d66052bc065da1c81327f', // disabled Error: Returned error: execution reverted: VaultToken: INSUFFICIENT_RESERVES
        '0x1c669f6caaf59dbfe86e9d8b9fb694d4d06611d5', // disabled Error: Returned error: execution reverted: VaultToken: INSUFFICIENT_RESERVES
        '0x6cce00972bff06ec4fed6602bd22f65214e14d1f', // Not a smart contract
        // '0x9bf544e9e96033d1c8b667824844a40aa6c2132a', //
        '0x7eac79383c42bc16e33cd100008ee6d5e491680f', //
        '0x05b2bcb2295a6f07c5d490128b6b4787c8c4464e', //
        '0xd8d4a4738e285c33a2890fb2e225c692b84c55ca', //
      ]
    })
  }

  async function borrowed(_, _b, _cb, { api, }) {
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

    underlyings.forEach((v, i) => {
      // Lot of MAI pools have bad debt, ignoring it
      if (v.toLowerCase() !== '0xfb98b335551a418cd0737375a2ea0ded62ea213b') {
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