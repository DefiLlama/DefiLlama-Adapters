const { launchpadTvl } = require('../helper/umia')

module.exports = {
  methodology:
    "Bids escrowed in every Umia launch that has not settled yet: the launch contract (UmiaLBP) and its Uniswap Continuous Clearing Auction, counted in the launch currency. Launches are enumerated from the Umia hub, so a new launch is picked up without a code change. Venture tokens are not counted anywhere in TVL -- the tokens on sale are the venture's own, and DefiLlama keeps a platform's own token out of TVL. Once a launch settles, its raised capital moves to the venture treasury (tracked as a treasury adapter) and its canonical spot liquidity to the venture's own listing.",
  start: '2026-08-25',
  hallmarks: [
    ['2026-08-25', 'UMIA auction opens'],
    ['2026-09-02', 'UMIA settles, spot pool live'],
  ],
  base: { tvl: launchpadTvl },
}
