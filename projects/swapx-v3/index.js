const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')

// Xone / SwapX V3 factory
const FACTORY = '0xd357373500c6E5ce3A4CfA966b56F5241C7Af3c4'

const startBlocks = {
  xone: 3752039,
}

function chainTvl(chain) {
  return async (api) => {
    const START_BLOCK = startBlocks[chain]
    if (!Number.isInteger(START_BLOCK)) throw new Error(`missing START_BLOCK for ${chain}`)

    const logs = await getLogs({
      api,
      target: FACTORY,
      fromBlock: START_BLOCK,
      topic: 'PoolCreated(address,address,uint24,int24,address)',
    })

    const pairAddresses = []
    const token0Addresses = []
    const token1Addresses = []

    for (const log of logs) {
      token0Addresses.push(`0x${log.topics[1].slice(-40)}`.toLowerCase())
      token1Addresses.push(`0x${log.topics[2].slice(-40)}`.toLowerCase())
      pairAddresses.push(`0x${log.data.slice(-40)}`.toLowerCase())
    }

    // 组装 pair -> token0/token1
    const pairs = {}
    token0Addresses.forEach((t0, i) => { pairs[pairAddresses[i]] = { token0Address: t0 } })
    token1Addresses.forEach((t1, i) => {
      const addr = pairAddresses[i]
      pairs[addr] = { ...(pairs[addr] || {}), token1Address: t1 }
    })

    // 读池子里两侧代币余额
    const balanceCalls = []
    const exclude = [] // 如需排除问题池可写在这里
    for (const pair of Object.keys(pairs)) {
      if (exclude.includes(pair)) continue
      balanceCalls.push({ target: pairs[pair].token0Address, params: pair })
      balanceCalls.push({ target: pairs[pair].token1Address, params: pair })
    }

    const block = await api.getBlock()
    const tokenBalances = await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: balanceCalls,
      block,
      chain,
    })

    const balances = {}
    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, (i) => i)
    return balances
  }
}

module.exports = {
  misrepresentedTokens: true,
  xone: {
    tvl: chainTvl('xone'),
  },
}
