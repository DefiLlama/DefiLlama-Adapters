const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Souless launches markets against USDC on Arc and permanently locks every Uniswap v3 LP NFT.
// Direct launches have one position; guarded launches spread the liquidity over five positions.
const DIRECT_LOCKER = '0xd0905DB594A9281aC1bC64204cce340eE0241E0D'
const GUARDED_LOCKER = '0x2275A163611932e3BEd4110d67302226ee1A283e'
const POSITION_MANAGER = '0x39654A85A4C05127f5Fd6ED22CAeC077A0fB1377'

async function tvl(api) {
  return sumTokens2({
    api,
    // Both lockers have no NFT withdrawal path. Enumerating their current ERC721 holdings avoids
    // archive-log dependencies and includes every direct and guarded launch position by custody.
    uniV3nftsAndOwners: [
      [POSITION_MANAGER, DIRECT_LOCKER],
      [POSITION_MANAGER, GUARDED_LOCKER],
    ],
    // The launched token has no independent price source: counting it at the price of the same
    // pool being measured would make TVL reflexive. Only the USDC side is therefore included.
    uniV3WhitelistedTokens: [ADDRESSES.arc.USDC],
  })
}

module.exports = {
  methodology: 'TVL is the USDC side of every Uniswap v3 position held by the immutable Souless direct and guarded permanent LP lockers. Position ids are enumerated from each locker\'s current ERC721 holdings; the lockers expose no withdrawal path. The launched-token side and uncollected fees are excluded to avoid reflexive valuation. Marked doublecounted because these positions are also part of the underlying Uniswap v3 TVL on Arc.',
  doublecounted: true,
  start: '2026-09-10',
  arc: { tvl },
}
