const sdk = require("@defillama/sdk");
const { compoundExports } = require("../helper/compound");

const {tvl:lendingTvl, borrowed} = compoundExports("0x67340bd16ee5649a37015138b3393eb5ad17c195", "0xE24146585E882B6b59ca9bFaaaFfED201E4E5491")

module.exports = {
  deadFrom: '2023-02-16',
    bsc: {
    tvl: sdk.util.sumChainTvls([lendingTvl]),
    borrowed
  },
};

module.exports.bsc.borrowed = () => ({}) // bad debt