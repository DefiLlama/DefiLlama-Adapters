const utils = require("../helper/utils");
const { stakings } = require("../helper/staking");
const { toUSDTBalances } = require("../helper/balances");

const stakingpool = "0x0E84461a00C661A18e00Cab8888d146FDe10Da8D";

const ADDRESSES = require("../helper/coreAssets.json");

module.exports = {
  blast: {
    tvl: stakings([stakingpool], [ADDRESSES.blast.USDB, ADDRESSES.blast.WETH]),
  },
};
