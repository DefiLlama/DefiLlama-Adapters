const FACTORY = '0xdB2Ec80E55527b5D858b54173083139679f5DE6f'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

async function listPairs(api) {
  const pairCount = Number(await api.call({ target: FACTORY, abi: 'uint256:allPairsLength' }))
  if (!pairCount) return []
  return api.multiCall({
    abi: 'function allPairs(uint256) view returns (address)',
    calls: Array.from({ length: pairCount }, (_, index) => ({ target: FACTORY, params: [index] })),
  })
}

async function tvl(api) {
  const pairs = (await listPairs(api)).filter(pair => pair && pair !== ZERO_ADDRESS)
  if (!pairs.length) return
  const [tokens, quotes] = await Promise.all([
    api.multiCall({ abi: 'address:token', calls: pairs }),
    api.multiCall({ abi: 'address:quoteAsset', calls: pairs }),
  ])
  api.addTokens(tokens, pairs)
  api.addTokens(quotes, pairs)
}

module.exports = {
  methodology: 'Counts ERC-20 token and quote-asset balances held by every pair enumerated by the KOLSwap factory.',
  timetravel: true,
  robinhood: { tvl },
}
