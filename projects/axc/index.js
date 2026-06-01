const sdk = require('@defillama/sdk');


const bscTokens = [
    "0xfC787d44f3754aDd0242204533b2B4A7eB9876e1", // GYTW
    "0xb2F0d43f6496b38bb55AbEA0fD2ee5cC891AcB33", // GYT
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
      ["2025-12-31", "Grow Institutional Fund Token (GIFT) is a RWA token which seeks to track the value of the Grow Heritage Fund"],
      ["2026-04-23", "Growth Yield Token Whitelisted (GYTW) has reissued new tokens to clients with a new token name"],
      ["2026-04-26", "Growth Yield Token (GYT) is an permissionless RWA token that allows exposure to the Grow Heritage Fund"]
  ]
};
