
const CURVE_PMMS = {
  base: [
    "0x6Ccc8223532fff07f47EF4311BEB3647326894Ab",
    "0x000027B106df9f417980Bc4EdaDD1087c6f01B99",
    "0x00003bf45Ce34Bf1BeA78669f9A40ee630e11b99",
    "0x0000eFC4ec03a7c47D3a38A9Be7Ff1d52dD01b99"
  ],
  monad: [
    "0x0000a8fd148694aE3E17c079Ce4BBF8187758888",
  ]
};

async function tvl(api) {
  const tokenXs = await api.multiCall({ abi: 'address:X', calls: CURVE_PMMS[api.chain], permitFailure: true });
  const tokenYs = await api.multiCall({ abi: 'address:Y', calls: CURVE_PMMS[api.chain], permitFailure: true });
  const ownerTokens = CURVE_PMMS[api.chain].map((pool, i) => [[tokenXs[i], tokenYs[i]].filter(Boolean), pool]).filter(([tokens]) => tokens.length);
  return api.sumTokens({ ownerTokens });
}

module.exports = {
  methodology:
    "TVL is the total value of tokens held across LunarBase CurvePMM pool contracts on Base.",
  ...Object.keys(CURVE_PMMS).reduce((acc, chain) => {
    acc[chain] = { tvl };
    return acc;
  }, {}),
}

