const { pool2 } = require("../helper/pool2")
const { stakingUnknownPricedLP } = require("../helper/staking")
const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')


module.exports = {
  optimism: {
    tvl: sumTokensExport({ owner: '0xc911523c466b4E1dADE1bac9A2D4ceA3F9E1A2ae', tokens: [nullAddress] }),
    pool2: pool2("0x7Dbe3714371bB9FF72369AFc88703AbD2694E322", ["0x91d62ac270e5bb371a25f81c9e74f16b53448efd"], "optimism"),
    staking: stakingUnknownPricedLP("0x015C4b2250F7aAC41274FeB95eFf00016C0CE08c", "0x93d97dbb1bb5290c78c23885e8026047dc8998a8", "optimism", "0x91d62ac270e5bb371a25f81c9e74f16b53448efd", addr => `optimism:${addr}`)
  }
}
