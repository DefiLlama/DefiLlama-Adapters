const { staking } = require("../helper/staking")
const stakingpool = "0x0E84461a00C661A18e00Cab8888d146FDe10Da8D"

const ADDRESSES = require("../helper/coreAssets.json")

module.exports = {
  blast: {
    tvl: staking(stakingpool, [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH]),
  },
}
