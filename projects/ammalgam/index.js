const FACTORY = '0x1a411b0fd1f368d2f413a8cbb6aad425c923015b'
const VAULTS = [
  '0x8417430a31851ae0a36a854394227c5d86be8fc9', // USDC
  '0xbb211be8664128e30c6adcd5998eca9592be272f', // WETH
]

async function tvl(api) {
  const pairs = await api.fetchList({
    target: FACTORY,
    lengthAbi: 'uint256:allPairsLength',
    itemAbi: 'function allPairs(uint256) view returns (address)',
  })
  const underlyingTokens = await api.multiCall({
    abi: 'function underlyingTokens() view returns (address, address)',
    calls: pairs,
  })
  const tokensAndOwners = pairs.flatMap((pair, i) =>
    underlyingTokens[i].map(token => [token, pair]))

  await api.sumTokens({ tokensAndOwners })
  return api.erc4626Sum({
    calls: VAULTS,
    tokenAbi: 'address:asset',
    balanceAbi: 'uint256:totalAssets',
  })
}

module.exports = {
  methodology: 'Counts the underlying token balances held by every pair created by the Ammalgam factory and the reported total assets of the Ammalgam USDC and WETH vaults. Assets borrowed out of the pairs are excluded from TVL.',
  ethereum: { tvl },
}
