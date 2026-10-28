// Polydash Staking-as-a-Service: permissionless staking pools deployed by the Polydash factories.
// Counts each pool's `totalStaked` of its `stakeToken` (excludes undistributed reward tokens,
// which matters when stakeToken == rewardToken). Staked POLYDASH goes to `staking`, everything else to `tvl`.
const POLYDASH = '0x319525528f42167ef7fc18b77b889958080568e4'
const factories = [
  '0x0aAEa47d2e7303EC5a809062eafa59e7F011D857', // v1
  '0x904b8F5d95B593b5F4a6Dbb116b58e1d5CBe93f0', // v2
]

async function getPools(api) {
  const pools = []
  for (const target of factories)
    pools.push(...await api.fetchList({ lengthAbi: 'uint256:poolsLength', itemAbi: 'function allPools(uint256) view returns (address)', target }))
  const tokens = await api.multiCall({ abi: 'address:stakeToken', calls: pools })
  const staked = await api.multiCall({ abi: 'uint256:totalStaked', calls: pools })
  return pools.map((p, i) => ({ token: tokens[i], staked: staked[i] }))
}

const build = (isStaking) => async (api) => {
  const pools = await getPools(api)
  pools.forEach(({ token, staked }) => {
    if ((token.toLowerCase() === POLYDASH) === isStaking) api.add(token, staked)
  })
}

module.exports = {
  methodology: 'Sums totalStaked of every staking pool created by the Polydash staking factories (v1 and v2). Staked POLYDASH is counted as staking; other staked tokens are counted as TVL. Reward tokens held by pools are excluded.',
  robinhood: { tvl: build(false), staking: build(true) },
}
