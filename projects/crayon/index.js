// desks
const owners = [
  '0x8351483e30928D1Fe1f80eD5062c6438faa85b88',
  '0x3454923795c5EdD5b3967e3B63140c343e6BB3dF',
  '0x5dE27C6D5524EE07c0dB88CAB65022E3210a81c4',
  '0x343d5F534C4C1fB83cdDf0875cC91591cCf69416',
  '0x635b2fE7bF8d41B0477A492f953f57b40E385Cfb',
  '0xfE2A45BF13965393c863460F063bDD4a9874c415'
];

async function borrowed(_, _1, _2, { api }) {
  const tokens = await api.multiCall({ calls: owners, abi: 'address:base_coin', });
  const bals = await api.multiCall({ calls: owners, abi: 'uint256:total_loans', });

  api.addTokens(tokens, bals)

  return api.getBalances();
}

async function tvl(_, _1, _2, { api }) {
  const tokens = await api.multiCall({ calls: owners, abi: 'address:base_coin', });
  return api.sumTokens({ tokensAndOwners2: [tokens, owners] });
}

module.exports = {
  arbitrum: {
    tvl, borrowed
  }
}

