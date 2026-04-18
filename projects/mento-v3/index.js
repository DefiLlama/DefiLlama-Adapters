const FPMM_FACTORY = '0xa849b475FE5a4B5C9C3280152c7a1945b907613b'

async function tvl(api) {
  const pools = await api.call({ abi: 'address[]:deployedFPMMAddresses', target: FPMM_FACTORY })
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
  const tokensAndOwners2 = [token0s.concat(token1s), pools.concat(pools)]
  return api.sumTokens({ tokensAndOwners2 })
}

module.exports = {
  methodology: 'TVL is the total value of tokens held in Mento FPMM liquidity pools.',
  celo: { tvl },
  monad: { tvl },
}
