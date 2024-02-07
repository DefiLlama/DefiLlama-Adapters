const tokens = [
  '0xEf5AAcB3c38a5Be7785a361008e27fb0328a62B5', // secured private credit token
  // '0xE16f2eC94E8a0819EB93022c45E05D582f4E5c15', // private credit token
];

async function tvl(_, _1, _2, { api }) {
  const uTokens = await api.multiCall({ abi: 'address:usdc', calls: tokens })
  return api.sumTokens({ tokensAndOwners2: [uTokens, tokens,] })
}
async function borrowed(_, _1, _2, { api }) {
  const uTokens = await api.multiCall({ abi: 'address:usdc', calls: tokens })
  const bals = (await api.multiCall({ abi: 'uint256:totalPooledUSD', calls: tokens })).map(i => i / 1e12)
  const inContracts = (await api.multiCall({ abi: 'address:reserveUSD', calls: tokens })).map(i => i * -1)
  api.add(uTokens, bals)
  api.add(uTokens, inContracts)
  return api.getBalances()
}

module.exports = {
  methodology: "Sums the locked collateral amounts and depositor token balances.",
  ethereum: {
    tvl, borrowed,
  },
};
