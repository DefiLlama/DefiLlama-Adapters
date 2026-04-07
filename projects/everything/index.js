const config = {
  arbitrum: {
    factory: '0xa88216E6Cf409a25c719234C4817628Ae406b6A7',
    vault: '0xabD8DC06559634e59F6698c33A5E65e90e917b91',
  },
}

/** @description Fetches all pairs from the factory and their associated token addresses */
async function getPairsAndTokens(api, factory) {
  const pairs = await api.fetchList({
    lengthAbi: 'uint256:getAllPairsLength',
    itemAbi: 'function getPairAtIndex(uint256) view returns (address)',
    target: factory,
  })
  const tokens = await api.multiCall({ abi: 'function getTokens() view returns (address, address)', calls: pairs })
  return { pairs, tokens }
}

/** @description Calculates TVL by summing tokens locked in AMM pairs and the vault */
async function tvl(api) {
  const { factory, vault } = config[api.chain]
  const { pairs, tokens } = await getPairsAndTokens(api, factory)
  const ownerTokens = pairs.map((pair, i) => [tokens[i], pair])
  const allTokens = [...new Set(tokens.flat())]
  ownerTokens.push([allTokens, vault])
  return api.sumTokens({ ownerTokens })
}

/** @description Calculates total borrowed amounts for each token across all pairs */
async function borrowed(api) {
  const { factory } = config[api.chain]
  const { pairs, tokens } = await getPairsAndTokens(api, factory)
  const borrowed0 = await api.multiCall({ abi: 'uint256:getTotalBorrowed0', calls: pairs })
  const borrowed1 = await api.multiCall({ abi: 'uint256:getTotalBorrowed1', calls: pairs })
  for (let i = 0; i < pairs.length; i++) {
    api.add(tokens[i][0], borrowed0[i])
    api.add(tokens[i][1], borrowed1[i])
  }
}

module.exports = {
  methodology: 'TVL counts tokens locked in AMM pools and collateral in the vault. Borrowed counts tokens borrowed from the lending module.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, borrowed }
})
