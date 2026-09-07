const { get } = require('../helper/http')
const ADDRESSES = require('../helper/coreAssets.json')

// Perpshood (perpshood.fun) is a launchpad on Robinhood Chain where every coin's trading fees
// fund a real leveraged perp position backing it. Coins trade on Pons v2 bonding curves until
// graduation, when liquidity moves to Uniswap V4 and the curve closes.
//
// TVL is the quote-side reserves (native ETH or an approved pair token such as a tokenized
// stock) held by each live curve. The launch factory is shared infrastructure used by several
// launchpads, so "launched via perpshood" is not derivable on-chain — the platform publishes
// its own curve list, and every balance is then read from the chain.
const FEED = 'https://perpshood.fun/api/llama.json'

async function tvl(api) {
  const { curves } = await get(FEED)
  return api.sumTokens({
    ownerTokens: curves.map(({ curve, pair }) => [[pair, ADDRESSES.null], curve]),
  })
}

module.exports = {
  methodology:
    'TVL is the quote-asset reserves (native ETH or approved pair tokens such as tokenized stocks) held by the Pons v2 bonding curve of every live perpshood-launched coin; balances are read on-chain. The curve list comes from perpshood.fun/api/llama.json because the launch factory is shared infrastructure and perpshood launches are not distinguishable on-chain. Graduated coins (liquidity in Uniswap V4) are excluded, as is the leveraged perp margin backing each coin, which sits on the Lighter venue.',
  robinhood: { tvl },
}
