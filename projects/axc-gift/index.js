const sdk = require('@defillama/sdk');


const bscTokens = [
  "0x6Eca9D3B1ef79F5b45572fb8204835C6A4502bE9", // GIFT
];

async function getTokensTvl(api, chain, tokens) {
  const balances = {};
  for (const tokenAddress of tokens) {
    const totalSupplyRes = await sdk.api.erc20.totalSupply({
      target: tokenAddress,
      chain,
      block: api.block,
    });
    balances[`${chain}:${tokenAddress}`] = totalSupplyRes.output;
  }
  return balances;
}

module.exports = {
  bsc: {
    tvl: (api) => getTokensTvl(api, 'bsc', bscTokens)
  },
  hallmarks: [
    ["2025-12-31", "Grow Institutional Fund Token (GIFT) is a RWA token which seeks to track the value of the Grow Heritage Fund"]
  ]
};
