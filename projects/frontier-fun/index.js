const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

// Frontier (frontier.fun) — bonding-curve token launchpad on Robinhood Chain (4663).
// Each launched token custodies the native ETH its own curve raises, so TVL is the
// ETH sitting in un-graduated token contracts. When a curve fills, the token pays
// the creator fee and seeds a Uniswap V4 pool in the same transaction, leaving its
// own balance at zero — graduated markets therefore drop out on their own, and
// their liquidity is already counted by the uniswap-v4 adapter on this chain.
const FACTORY = '0x3cbC9395046607C083B383DC3588A3e8308dFf54'
const FROM_BLOCK = 23650298 // block of the first CoinDeployed event

const COIN_DEPLOYED_EVENT = 'event CoinDeployed(address indexed creator, address indexed token, address factory, address lp, string name, string symbol, string description, string image, uint256 initialSupply, uint256 maxSupply, uint256 initialETHReserves, uint256 initialPrice, uint256 initialMarketCap, uint256 targetETH)'

async function tvl(api) {
  const logs = await getLogs2({ api, factory: FACTORY, eventAbi: COIN_DEPLOYED_EVENT, fromBlock: FROM_BLOCK })
  return api.sumTokens({ tokensAndOwners: logs.map(log => [ADDRESSES.null, log.token]) })
}

module.exports = {
  methodology:
    'Counts the native ETH held by Frontier bonding-curve token contracts on Robinhood Chain, enumerated from the factory\'s CoinDeployed events. Each token custodies the ETH its own curve raises until the curve fills, at which point the token pays out the creator fee and seeds a Uniswap V4 pool in the same transaction and its balance goes to zero — so graduated markets are excluded here and their liquidity is counted by the Uniswap V4 adapter instead. The launched tokens themselves are not counted.',
  start: '2026-07-30',
  robinhood: { tvl },
}
