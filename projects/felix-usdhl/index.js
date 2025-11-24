const { staking } = require("../helper/staking");

module.exports = {
  ethereum: {
    tvl: staking('0x36f586A30502AE3afb555b8aA4dCc05d233c2ecE', '0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b')
  },
  hyperliquid: {
    tvl: staking('0xb50a96253abdf803d85efcdce07ad8becbc52bd5', '0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b')
  },
}