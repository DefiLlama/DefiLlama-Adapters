const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const farms = await api.call({
    target: '0xC4fb09E0CD212367642974F6bA81D8e23780A659',
    abi: 'function getFarmList() view returns (address[])',
  })
  const rewardTokens = await api.multiCall({
    calls: farms,
    abi: 'function getRewardTokens() view returns (address[])',
  })

  const toa = []
  farms.forEach((o, i) => {
    rewardTokens[i].forEach(t => toa.push([t, o]))
  });
  await sumTokens2({  api, owners: farms, resolveUniV3: true, })
  const camelotFarms = (await api.multiCall({ abi: 'address:nftPool', calls: farms, permitFailure: true, })).map((v, i) => v ? [v, farms[i]] : null).filter(v => v)
  await Promise.all(camelotFarms.map(i => getFarmTvl(api, i)))
  return sumTokens2({ api, tokensAndOwners: toa, })
}

async function getFarmTvl(api, [nftPool, farm]) {
  const poolInfo = await api.call({ abi: "function getPoolInfo() view returns (address lpToken, address grailToken, address xGrailToken, uint256 lastRewardTime, uint256 accRewardsPerShare, uint256 lpSupply, uint256 lpSupplyWithMultiplier, uint256 allocPoint)", target: nftPool, })
  const tokenCount = await api.call({  abi: 'erc20:balanceOf', target: nftPool, params: farm, })
  const calls = []
  for (let i= 0;i< +tokenCount;i++) calls.push({ params: [farm, i]})
  const tokenIds = await api.multiCall({  abi: 'function tokenOfOwnerByIndex(address,uint256) view returns (uint256)', calls, target: nftPool})
  const positions = await api.multiCall({  abi: "function getStakingPosition(uint256 tokenId) view returns (uint256 amount, uint256 amountWithMultiplier, uint256 startLockTime, uint256 lockDuration, uint256 lockMultiplier, uint256 rewardDebt, uint256 boostPoints, uint256 totalMultiplier)", calls: tokenIds, target: nftPool,})
  positions.forEach((position, i) => {
    api.add(poolInfo.lpToken, position.amount)
  })
}

module.exports = {
  doublecounted: true,
  arbitrum: { tvl }
}