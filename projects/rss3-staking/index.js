const ADDRESSES = require('../helper/coreAssets.json')
const STAKING_CONTRACT = "0x28F14d917fddbA0c1f2923C406952478DfDA5578"
const RSS3_TOKEN_ETH = "0xc98D64DA73a6616c42117b582e832812e7B8D57F"
const RSS3_TOKEN_VSL = ADDRESSES.optimism.OP
const { staking } = require("../helper/staking")


module.exports = {
  hallmarks: [[1710047755, "Mainnet Alpha Staking Launch"]],
  rss3_vsl: {
    tvl: () => ({}),
    staking: staking(STAKING_CONTRACT, RSS3_TOKEN_VSL, undefined, RSS3_TOKEN_ETH),
  },
}