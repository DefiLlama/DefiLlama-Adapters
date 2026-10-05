const { sumTokens2 } = require('../helper/unwrapLPs')

const GAMES = [
  '0xfB9017fd176747Dd7D67dA2CF05E7735543ec5F9',
  '0x1cF459104a2E0E5806a2c28722a1Fab4e5585Cc1',
  '0x90Ca273088097f6B4b4869D597A74b6d4F7b102f',
  '0xE504a0b1AAa95F80221CEEd0eFf44Ba85beAd798',
]

const TOKENS = [
  '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168',
  '0x500d15e7c0d0e99ac4aae2a40d8738ba1b3167c9',
  '0x020bfc650a365f8bb26819deaabf3e21291018b4',
  '0x98096d17e191b3da1d5f99a6d7b3584351b11e18',
]

async function tvl(api) {
  return sumTokens2({ api, owners: GAMES, tokens: TOKENS })
}

module.exports = {
  methodology: 'TVL is the prize money and unsettled entry funds held by the Chance InstantWin and MultiWin game contracts on Robinhood Chain.',
  start: '2026-09-24',
  robinhood: { tvl },
}
