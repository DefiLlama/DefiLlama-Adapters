const { sumTokensExport } = require("../helper/unwrapLPs");

// CurvePMM pool on Base — holds all reserves (tradable + LP + fees)
const CURVE_PMM = "0x6Ccc8223532fff07f47EF4311BEB3647326894Ab";

module.exports = {
  methodology:
    "TVL is the total value of tokens held in the LunarBase CurvePMM pool contract on Base.",
  base: {
    tvl: async (api) => {
      // Read token addresses from the pool contract
      const [tokenX, tokenY] = await Promise.all([
        api.call({ target: CURVE_PMM, abi: "address:X" }),
        api.call({ target: CURVE_PMM, abi: "address:Y" }),
      ]);

      // Sum ERC-20 balances held by the pool
      await api.sumTokens({ owner: CURVE_PMM, tokens: [tokenX, tokenY] });
      return api.getBalances();
    },
  },
};
