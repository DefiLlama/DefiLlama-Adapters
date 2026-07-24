const FACTORY = '0x1a411b0fd1f368d2f413a8cbb6aad425c923015b'

async function getPairData(api) {
  const pairs = await api.fetchList({
    target: FACTORY,
    lengthAbi: 'uint256:allPairsLength',
    itemAbi: 'function allPairs(uint256) view returns (address)',
  })
  const underlyingTokens = await api.multiCall({
    abi: 'function underlyingTokens() view returns (address, address)',
    calls: pairs,
  })
  return { pairs, underlyingTokens }
}

async function tvl(api) {
  const { pairs, underlyingTokens } = await getPairData(api)
  const tokensAndOwners = pairs.flatMap((pair, i) =>
    underlyingTokens[i].map(token => [token, pair]))
  return api.sumTokens({ tokensAndOwners })
}

async function borrowed(api) {
  const { pairs, underlyingTokens } = await getPairData(api)
  // totalAssetsAndShares returns 6 token types: [depositL, depositX, depositY, borrowL, borrowX, borrowY]
  // borrowX/borrowY (indices 4/5) are the borrowed amounts of the two underlying tokens.
  const allAssets = await api.multiCall({
    abi: 'function totalAssetsAndShares(bool withInterest) view returns (uint112[6] allAssets, uint112[6] allShares)',
    calls: pairs.map(pair => ({ target: pair, params: [true] })),
  })
  pairs.forEach((_, i) => {
    const [tokenX, tokenY] = underlyingTokens[i]
    api.add(tokenX, allAssets[i].allAssets[4])
    api.add(tokenY, allAssets[i].allAssets[5])
  })
}

module.exports = {
  methodology: 'TVL counts the underlying token balances held by every pair created by the Ammalgam factory. Borrowed counts the assets borrowed out of the pairs.',
  ethereum: { tvl, borrowed },
}
