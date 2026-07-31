const TREASURY = "0x1b3bb8790b47855bDE2f43A56b6aa3E44E1F60AE";
const USDG = "0x5fc5360d0400a0fd4f2af552add042d716f1d168";
async function tvl(api) {
  return api.sumTokens({
    owner: TREASURY,
    tokens: [USDG],
  });
}
module.exports = {
  methodology:
    "TVL is the USDG held in the Wildcard Games Treasury on Robinhood Chain, serving as bankroll for player payouts.",
  robinhood: {
    tvl,
  },
};
