const sdk = require('@defillama/sdk');


const hskTokens = [
  "0x80C080acd48ED66a35Ae8A24BC1198672215A9bD", // AoABT
  "0x34B842D0AcF830134D44075DCbcE43Ba04286c12", // AoABTb
  "0xf00A183Ae9DAA5ed969818E09fdd76a8e0B627E6", // AoABTa12m
];
const avaxTokens = [
  "0xB2EA3E7b80317c4E20D1927034162176e25834E2", // AoABTd
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
  hsk: {
    tvl: (api) => getTokensTvl(api, 'hsk', hskTokens)
  },
  avax: {
    tvl: (api) => getTokensTvl(api, 'avax', avaxTokens)
  },
  hallmarks: [
    ["2025-10-12", "add multiple tokens for AoABT, each token corresponds to a different share class of the fund"]
  ]
};
