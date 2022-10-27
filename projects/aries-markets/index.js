const sdk = require("@defillama/sdk");
const { getResources, coreTokens } = require("../helper/aptos");
const { transformBalances } = require("../helper/portedTokens");

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    "Counts the lamports in each coin container in the Aries contract account.",
  aptos: {
    tvl: async () => {
      const balances = {};
      const data = await getResources(
        "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3"
      );

      const extractCoinAddress = (str) =>
        str.slice(str.indexOf("<") + 1, str.lastIndexOf(">")) ?? "";

      const coinContainers = data
        .filter((i) =>
          i.type.includes(
            "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve::ReserveCoinContainer"
          )
        )
        .map((i) => ({
          lamports: i.data.underlying_coin.value,
          tokenAddress: extractCoinAddress(i.type),
        }));

      coinContainers.forEach(({ lamports, tokenAddress }) => {
        sdk.util.sumSingleBalance(balances, tokenAddress, lamports);
      });

      return transformBalances("aptos", balances);
    },
  },
};
