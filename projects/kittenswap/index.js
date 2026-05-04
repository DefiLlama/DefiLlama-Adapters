const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

// Kittenswap is an Algebra-based concentrated-liquidity DEX on HyperEVM.
// TVL = sum of token balances in every liquidity pool ever created by the AlgebraFactory.
// We discover pools by scanning `Pool` events emitted at deployment time.
const FACTORY = '0x5f95E92c338e6453111Fc55ee66D4AafccE661A7'

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: FACTORY,
    eventAbi: 'event Pool(address indexed token0, address indexed token1, address pool)',
    onlyArgs: true,
    fromBlock: 1,
  })
  const ownerTokens = logs.map((log) => [[log.token0, log.token1], log.pool])
  return sumTokens2({ api, ownerTokens, permitFailure: true })
}

module.exports = {
  methodology:
    'TVL is the sum of token balances held in all liquidity pools deployed by the Kittenswap AlgebraFactory on HyperEVM.',
  hyperliquid: { tvl },
}