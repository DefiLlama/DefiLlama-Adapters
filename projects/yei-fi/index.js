const { aaveExports } = require("../helper/aave");
const sdk = require("@defillama/sdk");

function yeiExports(dataHelpers) {
  const exports = dataHelpers.map((h) =>
    aaveExports(undefined, "", undefined, [h])
  );

  return {
    tvl: async (api) => {
      const balances = {};
      for (const e of exports) {
        const v = await e.tvl(api);
        sdk.util.mergeBalances(balances, v);
      }
      return balances;
    },
    borrowed: async (api) => {
      const balances = {};
      for (const e of exports) {
        const v = await e.borrowed(api);
        sdk.util.mergeBalances(balances, v);
      }
      return balances;
    },
  };
}

module.exports = {
  sei: yeiExports([
    "0x60c82a40c57736a9c692c42e87a8849fb407f0d6", // main
    "0xE77F4334D2Ce16c19F66fD62c653377A39AEFee1", // solv
  ]),
};
