const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, sumTokensExport } = require('../helper/unwrapLPs')
const { staking } = require("../helper/staking");

const toa = [
  [nullAddress, '0x45218EDE6f026F0994C55b6Fa3554A8Ea989f819'],
  [ADDRESSES.bsc.USDT, '0x682ce0e340A0248B4554E14e834969F2E421dB2D'],
]

const lcToken = '0x6012C3a742f92103d238F1c8306cF8fbcDEca8B3'
const masterChef = '0x15D2a6FC45aF66A2952dC27c40450C1F06A1eC2b';

// node test.js projects/luckychip/index.js
module.exports = {
  methodology: 'TVL comes from the tables of LuckyChip for now.',
  bsc: {
    staking: staking(masterChef, lcToken),
    tvl: sumTokensExport({ tokensAndOwners: toa }),
  }
}
