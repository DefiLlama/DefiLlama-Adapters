async function tvl(api) {
  let dlmm_factory = "0x8Bb9727Ca742C146563DccBAFb9308A234e1d242";
  const pools = await api.fetchList({ target: dlmm_factory, itemAbi: 'getLBPairAtIndex', lengthAbi: 'getNumberOfLBPairs' })
  const tokenA = await api.multiCall({ abi: 'address:getTokenX', calls: pools, })
  const tokenB = await api.multiCall({ abi: 'address:getTokenY', calls: pools, })
  const tokensAndOwners2 = [tokenA.concat(tokenB), pools.concat(pools)]
  return api.sumTokens({ tokensAndOwners2 })
}
module.exports = {
  monad: { tvl },
}