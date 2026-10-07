const FACTORY = '0x95c8853e6bD1DBCE2428Aa6953eb7680261F22fe'

// A same-token pool holds its reward bucket next to the principal and can pay rewards out of
// principal when the bucket runs dry, so count what the pool holds, capped at what users staked.
const held = (bal, staked) => (BigInt(bal) < BigInt(staked) ? bal : staked)

async function tvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'uint256:idCounter', itemAbi: 'function allPools(uint256) view returns (address)', target: FACTORY })
  const tokens = await api.multiCall({ abi: 'address:stakingToken', calls: pools })
  const staked = await api.multiCall({ abi: 'uint256:totalStaked', calls: pools })

  // native (null address) and ERC20 balances, in pool order
  const bals = await api.getTokenBalances({ tokensAndOwners: pools.map((pool, i) => [tokens[i], pool]) })
  pools.forEach((_, i) => api.add(tokens[i], held(bals[i], staked[i])))
}

module.exports = {
  methodology:
    'Sums every token users have staked in the staking pools on Xphere. Each pool counts the lesser of its token balance and its recorded stake, which leaves out the reward funds an admin deposits and any principal already paid out as rewards.',
  start: '2026-04-24',
  xp: { tvl },
}
