const ADDRESSES = require('../helper/coreAssets.json')

// BlueFun bonding curves custody native assets until a token graduates into a
// Uniswap v4 pool. Graduated liquidity is counted by the DEX, not here.
const markets = {
  base: [
    '0xb503b0ef06ec10554f4d960e08869877a41498dd', // legacy
    '0x7d42dd1435e9567C1edFb513C45c8eA82fe03a38', // vNext
  ],
  robinhood: [
    '0x2d6d77652facbbcae05c0dc3aed792b94cd61fa8', // legacy
    '0x2F46a783C1314e160d673F927464d85B7364D807', // vNext
  ],
}

async function tvl(api) {
  return api.sumTokens({
    owners: markets[api.chain],
    tokens: [ADDRESSES.null],
  })
}

module.exports = {
  // Direct and graduated pools are already included in Uniswap v4's TVL.
  doublecounted: true,
  methodology: 'Counts native assets held in BlueFun bonding-curve markets on Base and Robinhood Chain before graduation. Assets are withdrawn from a curve as it graduates into Uniswap v4, whose pool liquidity is counted by the DEX adapter instead.',
  base: { tvl },
  robinhood: { tvl },
}
