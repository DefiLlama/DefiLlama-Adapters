
const CURVE_PMMS = [
  "0x6Ccc8223532fff07f47EF4311BEB3647326894Ab",
  "0x000027B106df9f417980Bc4EdaDD1087c6f01B99",
];

async function tvl(api) {
  const ownerTokens = await Promise.all(CURVE_PMMS.map(async (pool) => {
    const [tokenX, tokenY] = await Promise.all([
      api.call({ abi: 'address:X', target: pool }),
      api.call({ abi: 'address:Y', target: pool }),
    ]);
    return [[tokenX, tokenY], pool];
  }));

  await api.sumTokens({ ownerTokens });
  return api.getBalances();
}

module.exports = {
  methodology:
    "TVL is the total value of tokens held across LunarBase CurvePMM pool contracts on Base.",
  base: {
    tvl,
  },
}
