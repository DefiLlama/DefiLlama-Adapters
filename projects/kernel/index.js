const abi  =  {
  tokens: "function tokens(address) view returns (address vaultToken, address rateProvider, uint256 cap, uint256 deposited, bool paused)"
}

const ASSETS = [
  "0xf02C96DbbB92DC0325AD52B3f9F2b951f972bf00", // krETH
  "0x513D27c94C0D81eeD9DC2a88b4531a69993187cF", // ksETH
  "0x0bB9aB78aAF7179b7515e6753d89822b91e670C4", // kUSD
]

const tvl = async (api) => {
  const tokens = await api.fetchList({ lengthAbi: 'numApprovedTokens', itemAbi: 'approvedTokens', calls: ASSETS, groupedByInput: true, });
  const assets = []
  const balanceCalls = []
  tokens.forEach((tokens, i) => {
    assets.push(...tokens)
    balanceCalls.push(...tokens.map(token => ({ target: ASSETS[i], params: token })))
  })
  const balances = (await api.multiCall({ calls: balanceCalls, abi: abi.tokens })).map(i => i.deposited)
  api.add(assets, balances)
};

module.exports = {
  doublecounted: true,
  methodology: 'The TVL represents the sum of each LST deposited in the protocol',
  ethereum: {
    tvl,
  },
};

