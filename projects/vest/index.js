const { staking } = require("../helper/staking");
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: "Total USDC locked in the Vest Exchange.",
  start: 1710709200,
  era: {
    tvl: staking('0xf7483A1464DeF6b8d5A6Caca4A8ce7E5be8F1F68', ADDRESSES.era.USDC),
  },
}