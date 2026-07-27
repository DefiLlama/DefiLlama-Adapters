// Only tracks mezo vaults - external ones are tracked in their corresponding adapter (e.g. mellow-protocol-core/index.js)
// https://github.com/mezo-org/documentation/blob/main/src/content/docs/docs/users/mezo-earn/vaults/index.md#vault-types
const VAULTS = [
  '0xb4D498029af77680cD1eF828b967f010d06C51CC', // sMUSD — MUSD Savings Rate
];

async function tvl(api) {
  const strategies = await api.multiCall({ calls: VAULTS, abi: 'address:strategy' });
  const tokens = await api.multiCall({ calls: strategies, abi: 'address:token' });
  const tokensAndOwners = VAULTS.flatMap((vault, i) => [
    [tokens[i], vault],
    [tokens[i], strategies[i]],
  ]);
  return api.sumTokens({ tokensAndOwners });
}

module.exports = {
  methodology: 'Sums underlying-token balances held at each Mezo native earn vault and its strategy contract. Currently covers the MUSD Savings Rate (sMUSD).',
  mezo: { tvl },
};
