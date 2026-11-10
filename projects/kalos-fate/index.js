const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Kalos Fate (https://www.kalos.fun) on Kinetiq Elysium: an NFT chance game. A player stakes part of a KalosMarket
// listing's price for the same chance (minus a 1% edge) to win the NFT; on a win the house buys the listing for the player.
// KalosFateHouse (upgradeable proxy) holds the native HYPE bankroll, deposited against kFATE shares, and escrows each
// entrant's stake until the attempt settles. Contracts: https://www.kalos.fun/learn/contracts
const FATE_HOUSE = '0xCA10517731a5D3709b40A76DdF382A647852d6ac'

module.exports = {
  methodology: 'TVL is the native HYPE held by the Kalos Fate house contract: the kFATE bankroll that pays for winning attempts, plus the stakes it escrows for attempts not settled yet.',
  start: '2026-11-09',
  elysium: {
    tvl: sumTokensExport({ owner: FATE_HOUSE, tokens: [ADDRESSES.null] }),
  },
}
