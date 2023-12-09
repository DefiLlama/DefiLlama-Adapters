const { call } = require("../helper/chain/near");
async function tvl() {
  const OneNekoToUsdcValue =
    Number(
      await call("v2.ref-finance.near", "get_return", {
        pool_id: 3804,
        token_in: "ftv2.nekotoken.near",
        amount_in: "1000000000000000000000000",
        token_out:
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
      })
    ) / 1e6;

  const OneUsdcToNearValue =
    Number(
      await call("v2.ref-finance.near", "get_return", {
        pool_id: 3,
        token_in:
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
        amount_in: "1000000",
        token_out: "wrap.near",
      })
    ) / 1e24;

  const LPData = await call("v2.ref-finance.near", "get_pool", {
    pool_id: 3804,
  });

  const NEKOStakedInFactory = await call(
    "cookie.nekotoken.near",
    "get_total_staked",
    {}
  );

  const NEKOAmount = LPData.amounts[0] / 1e24;
  const USDCAmount = LPData.amounts[1] / 1e6;

  const totalNearValueLocked =
    NEKOAmount * OneNekoToUsdcValue * OneUsdcToNearValue +
    USDCAmount * OneUsdcToNearValue +
    (NEKOStakedInFactory / 1e24) * OneNekoToUsdcValue * OneUsdcToNearValue;

  return {
    near: totalNearValueLocked,
  };
}
module.exports = {
  near: {
    tvl,
  },
  timetravel: false,
  methodology: "Count the total value locked in LP and staked in the factory",
};
