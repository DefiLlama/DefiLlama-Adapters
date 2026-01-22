const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const BSC_OWNERS = [
  '0xbb0Bb14102001763c5bB5C54c5CB2ED922303936',
  '0x85Ee4B62B3d6564aBcC7eFC65fA2aD9dB3a875d3',
]

const NATIVE_BNB = ADDRESSES.null

module.exports = {
  start: 1739826962,
  methodology:
    'We sum the native BNB balance held by protocol-owned contracts on BNB Chain. The adapter returns raw balances; DefiLlama handles pricing in USD.',
  bsc: {
    tvl: sumTokensExport({
      owners: BSC_OWNERS,
      tokens: [NATIVE_BNB],
    }),
  },
}
