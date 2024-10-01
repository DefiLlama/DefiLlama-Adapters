const vaults = {
  arbitrum: "0x8BfED25d58d4c38a3A9BCa1aC45bcFD866A3a88c",
  bsc: "0x5712ab97A299a8A4544BCc728B7f3E9663965443",
  avax: "0x5712ab97A299a8A4544BCc728B7f3E9663965443",
  polygon: "0x5712ab97A299a8A4544BCc728B7f3E9663965443",
  fantom: "0x139b227B7Fc46CE6AB2efE7cE6463DD97E6b0A7A",
  kava: "0x5712ab97A299a8A4544BCc728B7f3E9663965443",
}

const theseusVaults = {
  arbitrum: { vault: '0x6D8E0Ac94fb79Cd3520f546ce1c23A6F27F16EaC', gmxPlugin: '0xD4497259a3535ae311AB0F6ad68Da43a676919Db' },
}

async function tvl(api) {
  if (theseusVaults[api.chain]) {
    const { vault, gmxPlugin } = theseusVaults[api.chain]
    const tokens = await api.call({ abi: 'address[]:getAcceptedTokens', target: vault })
    const gmxPoolAbi = "function getPools() view returns ((uint8 poolId, address indexToken, address longToken, address shortToken, address marketToken)[])"
    const gmxTokens = await api.call({ abi: gmxPoolAbi, target: gmxPlugin })
    const ownerTokens = [[tokens, vault], [gmxTokens.map(t => t.marketToken), gmxPlugin]]
    await api.sumTokens({ ownerTokens })
  }


  const vault = vaults[api.chain];
  const tokens = await api.call({ abi: 'function getAcceptingTokens () view returns (address[])', target: vault, });
  const bals = await api.multiCall({ abi: 'function getStakedAmountPerToken(address token) view returns (uint256)', calls: tokens, target: vault })
  api.addTokens(tokens, bals)
  return api.sumTokens({ owner: vault, tokens })
}

module.exports = {
  methodology: 'To calculate the TVL for the Mozaic project, we first identify the vault addresses for each supported chain (Arbitrum, BSC, AVAX, Polygon, Fantom, Kava). For each vault, we retrieve the list of accepted tokens using the `getAcceptingTokens` function. We then determine the staked amount for each token using the `getStakedAmountPerToken` function. The TVL is the sum of all these staked amounts across all tokens and chains.',
};

Object.keys(vaults).forEach(chain => {
  module.exports[chain] = { tvl }
})