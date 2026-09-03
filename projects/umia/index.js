const { launchpadTvl } = require('../helper/umia')

module.exports = {
  methodology:
    "The launch currency held by every Umia launch contract (UmiaLBP) and its Uniswap Continuous Clearing Auction. While an auction runs this is the escrowed bids. Once it settles the raised capital moves to the venture treasury (tracked as a treasury adapter) and the canonical spot liquidity to the venture's own listing, leaving the unspent change still owed to bidders who have not exited, which they can withdraw at any time. Launches are enumerated from the Umia hub, so a new launch is picked up without a code change. Venture tokens are not counted anywhere in TVL -- the tokens on sale are the venture's own, and DefiLlama keeps a platform's own token out of TVL.",
  start: '2026-08-25',
  hallmarks: [
    ['2026-08-25', 'UMIA auction opens'],
    ['2026-09-02', 'UMIA settles, spot pool live'],
  ],
  base: { tvl: launchpadTvl },
}
