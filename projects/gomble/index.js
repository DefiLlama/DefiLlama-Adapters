const stakingContractAddress = '0xAB8c9Eb287796F075C821ffafBaC5FeDAa4604d5';

async function tvl(api) {
  const tokens = await api.call({ abi: 'address[]:getRegisteredTokens', target: stakingContractAddress })
  const vTokens = await api.multiCall({ abi: 'function getRegisteredVToken(address) view returns (address)', calls: tokens, target: stakingContractAddress })
  return api.sumTokens({ owner: stakingContractAddress, tokens: vTokens.concat(tokens) })
}

module.exports = {
  bsc: {
    tvl,
  },
}
