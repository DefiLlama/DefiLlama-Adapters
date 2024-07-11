const { abi } = require('./abi')

const ASSETS = [
  "0xf02C96DbbB92DC0325AD52B3f9F2b951f972bf00", // krETH
  "0x513D27c94C0D81eeD9DC2a88b4531a69993187cF", // ksETH
  "0x0bB9aB78aAF7179b7515e6753d89822b91e670C4", // kUSD
];

const range = (length) => Array.from({ length }, (_, i) => i);

const fetchApprovedTokens = async (api, assets) => {
  const numTokensAllowed = await api.multiCall({calls: assets, abi: abi.numApprovedTokens})
  const calls = numTokensAllowed.flatMap((numTokens, assetIndex) =>
    range(numTokens).map(tokenIndex => ({ target: assets[assetIndex], params: [tokenIndex] }))
  );

  return api.multiCall({ calls, abi: abi.approvedTokens });
}

const fetchTokenBalances = async (api, assets, approvedTokens) => {
  const calls = assets.flatMap((asset) => {
    return approvedTokens.map((token) => ({target: asset, params: token}))
  })
  
  const balances = await api.multiCall({calls, abi: abi.tokens})
  balances.forEach(({ deposited }, index) => {
    api.add(calls[index].params, deposited)
  })
}

const tvl = async (api) => {
  const approvedTokens = await fetchApprovedTokens(api, ASSETS);
  return fetchTokenBalances(api, ASSETS, approvedTokens)
};

module.exports = {
  doublecounted: true,
  methodology: 'The TVL represents the sum of each LST deposited in the protocol',
  ethereum: {
    tvl,
  },
};

