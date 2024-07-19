const abi = require('./abi')
const { sumTokens2 } = require('../helper/unwrapLPs')
const farm = "0xa65D04f79633BeBdC4Dd785498269e8ABD6A1476"

async function tvl(api) {
  const poolInfos = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: farm })
  let pools = poolInfos.map(i => i.lpToken)
  const stakingPools = pools.slice(0, 3)
  pools = pools.slice(3)
  const stakingTokens = await api.multiCall({ abi: abi.underlyingToken, calls: stakingPools })
  const tokens = await api.multiCall({ abi: 'address:want', calls: pools })
  const bals = await api.multiCall({ abi: 'uint256:balanceOf', calls: pools })
  api.addTokens(tokens, bals)
  return sumTokens2({ api, tokensAndOwners2: [stakingTokens, stakingPools] })
}

module.exports = {
  era: {
    tvl,
  }
}

