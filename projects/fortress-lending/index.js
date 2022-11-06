const sdk = require("@defillama/sdk");
const { compoundExports } = require("../helper/compound");

const {tvl:lendingTvl, borrowed} = compoundExports("0x67340bd16ee5649a37015138b3393eb5ad17c195", "bsc", "0xE24146585E882B6b59ca9bFaaaFfED201E4E5491", "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c")

module.exports = {
  timetravel: true,
  bsc: {
    tvl: sdk.util.sumChainTvls([lendingTvl]),
    borrowed
  },
};