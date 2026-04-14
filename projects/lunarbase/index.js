
const CURVE_PMMS = [
  "0x6Ccc8223532fff07f47EF4311BEB3647326894Ab",
  "0x000027B106df9f417980Bc4EdaDD1087c6f01B99",
];

module.exports = {
  methodology:
    "TVL is the total value of tokens held across LunarBase CurvePMM pool contracts on Base.",
  base: {
    tvl: async (api) => {
      const tokenXs = await api.multiCall({ abi: 'address:X', calls: CURVE_PMMS });
      const tokenYs = await api.multiCall({ abi: 'address:Y', calls: CURVE_PMMS });
      const ownerTokens = CURVE_PMMS.map((pool, i) => [[tokenXs[i], tokenYs[i]], pool]);
      return api.sumTokens({ ownerTokens });
    },
  },
}
