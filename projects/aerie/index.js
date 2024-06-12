const { sumUnknownTokens } = require('../helper/unknownTokens')

async function tvl(api) {
  const Indexer = '0x0336dfb02ba66ce75f5cc7898c3eafeddc493daf'
  let pools = await api.call({ abi: abi.getAllSaaSPools, target: Indexer })
  const isEnabled = await api.multiCall({ abi: abi.poolEnabled, calls: pools })
  pools = pools.filter((_, i) => isEnabled[i])
  const tokens = await api.multiCall({  abi: abi.stakedTokenAddress, calls: pools})
  const poolInfo = await api.multiCall({  abi: abi.pool, calls: pools})
  const bals = poolInfo.map(i => i.totalTokensStaked)
  api.addTokens(tokens, bals)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, lps: ['0x412cb411be14ec0ee87c2823f830d33dd37aa8f8']})
}

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: tvl,
  },
}

const abi = {
  "getAllSaaSPools": "address[]:getAllSaaSPools",
  "stakedTokenAddress": "address:stakedTokenAddress",
  "pool": "function pool() view returns (address creator, address tokenOwner, uint256 poolTotalSupply, uint256 poolRemainingSupply, uint256 totalTokensStaked, uint256 creationBlock, uint256 perBlockNum, uint256 lockedUntilDate, uint256 lastRewardBlock, uint256 accERC20PerShare, uint256 stakeTimeLockSec, bool isStakedNft, bytes32 website)",
  "poolEnabled": "bool:poolEnabled",
}