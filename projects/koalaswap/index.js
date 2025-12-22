const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')

const FACTORY = '0xcF3Ee60d29531B668Ae89FD3577E210082Da220b' // KoalaSwap factory
const startBlocks = {
  unit0: 2291892,
}

function chainTvl(chain) {
  return async (api) => {
    const START_BLOCK = startBlocks[chain]
    const logs = await getLogs({
      api,
      target: FACTORY,
      fromBlock: START_BLOCK,
      topic: 'PoolCreated(address,address,uint24,int24,address)',
    })

    const pairAddresses = []
    const token0Addresses = []
    const token1Addresses = []

    for (let log of logs) {
      token0Addresses.push(`0x${log.topics[1].substr(-40)}`.toLowerCase())
      token1Addresses.push(`0x${log.topics[2].substr(-40)}`.toLowerCase())
      pairAddresses.push(`0x${log.data.substr(-40)}`.toLowerCase())
    }

    const pairs = {}
    token0Addresses.forEach((token0Address, i) => {
      const pairAddress = pairAddresses[i]
      pairs[pairAddress] = {
        token0Address,
      }
    })

    token1Addresses.forEach((token1Address, i) => {
      const pairAddress = pairAddresses[i]
      pairs[pairAddress] = {
        ...(pairs[pairAddress] || {}),
        token1Address,
      }
    })

    const balanceCalls = []
    for (let pair of Object.keys(pairs)) {
      balanceCalls.push({
        target: pairs[pair].token0Address,
        params: pair,
      })
      balanceCalls.push({
        target: pairs[pair].token1Address,
        params: pair,
      })
    }

    const tokenBalances = await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: balanceCalls,
      block: api.block,
      chain,
    })

    const balances = {}
    const transform = (addr) => `${chain}:${addr}`

    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform)

    return balances
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL consists of tokens locked in KoalaSwap V3 liquidity pools.',
  unit0: {
    tvl: chainTvl('unit0'),
  },
}
