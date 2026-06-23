const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const { sumTokens2 } = require('../helper/unwrapLPs')

const staker = '0x95C683194B45d2d27842c2C87A7D5FfffD8A5eD6'
const stakerV2 = '0xb71886c52D754CF2B1D3d866c7Cfe9eeC01418a7'

const staking = async (api) => {
  const stakingToken = await api.call({ target: staker, abi: 'address:stakingToken' })
  const stakingTokenV2 = await api.call({ target: stakerV2, abi: 'address:dragon' })
  const balance = await api.call({ target: staker, abi: 'uint256:totalDeposits' })
  const balanceV2 = await api.call({ target: stakerV2, abi: 'uint256:totalDeposits' })
  api.add(stakingToken, balance)
  api.add(stakingTokenV2, balanceV2)
}

async function tvl(api) {
  const pools = await getConfig('dragonswap/uni-v3-pools', undefined, {
    fetcher: async () => {
      let { pools } = await get(`https://sei-api.dragonswap.app/api/v1/pools`)
      pools = pools.filter(i => i.type === 'V3_POOL').map(i => i.pool_address)
      return pools
    }
  })
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
  const ownerTokens = pools.map((v, i) => [[token0s[i], token1s[i]], v])
  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  sei: { tvl, staking },
}