const sdk = require('@defillama/sdk');


const bscTokens = [
  "0x1775504c5873e179Ea2f8ABFcE3861EC74D159bc", // CashPlus_BSC
];
const ethTokens = [
  "0x498D9329555471bF6073A5f2D047F746d522A373", // CashPlus_ETH
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
  ethereum: {
    tvl: (api) => getTokensTvl(api, 'ethereum', ethTokens)
  },
  hallmarks: [
    ["2025-10-14", "CASH+ is a 1:1 asset-backed token collateralized by the CMS USD Money Market Fund, which invests in high-quality short-term USD instruments."]
  ]
};
