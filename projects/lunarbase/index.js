
const CURVE_PMMS = [
  "0x6Ccc8223532fff07f47EF4311BEB3647326894Ab",
  "0x000027B106df9f417980Bc4EdaDD1087c6f01B99",
  "0x00003bf45Ce34Bf1BeA78669f9A40ee630e11b99",
  "0x0000eFC4ec03a7c47D3a38A9Be7Ff1d52dD01b99"
];

module.exports = {
  methodology:
    "TVL is the total value of tokens held across LunarBase CurvePMM pool contracts on Base.",
  base: {
    tvl: async (api) => {
      const tokenXs = await api.multiCall({ abi: 'address:X', calls: CURVE_PMMS, permitFailure: true });
      const tokenYs = await api.multiCall({ abi: 'address:Y', calls: CURVE_PMMS, permitFailure: true });
      const ownerTokens = CURVE_PMMS.map((pool, i) => [[tokenXs[i], tokenYs[i]].filter(Boolean), pool]).filter(([tokens]) => tokens.length);
      return api.sumTokens({ ownerTokens });
    },
  },
}

