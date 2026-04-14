

module.exports = {
  methodology:
    "TVL is the total value of tokens held in the LunarBase CurvePMM pool contract on Base.",
  base: {
    tvl: async (api) => {
      // CurvePMM pool on Base — holds all reserves (tradable + LP + fees)
      const CURVE_PMM = "0x6Ccc8223532fff07f47EF4311BEB3647326894Ab";
      const tokenX = await api.call({ abi: 'address:X', target: CURVE_PMM });
      const tokenY = await api.call({ abi: 'address:Y', target: CURVE_PMM });
      return api.sumTokens({ owner: CURVE_PMM, tokens: [tokenX, tokenY] });
    },
  },
}
