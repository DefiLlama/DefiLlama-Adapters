const FACTORY = '0xdB2Ec80E55527b5D858b54173083139679f5DE6f'

async function tvl(api) {
  const pairs = await api.fetchList({ lengthAbi: 'uint256:allPairsLength', itemAbi: 'function allPairs(uint256) view returns (address)', target: FACTORY })
  if (!pairs.length) return
  const [tokens, quotes] = await Promise.all([
    api.multiCall({ abi: 'address:token', calls: pairs }),
    api.multiCall({ abi: 'address:quoteAsset', calls: pairs }),
  ])
  const ownerTokens = pairs.map((pair, i) => [[tokens[i], quotes[i]], pair])
  await api.sumTokens({ ownerTokens })
}

module.exports = {
  methodology: 'Counts ERC-20 token and quote-asset balances held by every pair enumerated by the KOLSwap factory.',
  robinhood: { tvl },
}
