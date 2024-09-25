const abi = {
  getReserves: "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
  poolInfo: "function poolInfo(uint256) view returns (address token, uint256 allocPoint, uint256 lastRewardTime, uint256 accSkyPerShare, bool isStarted)"
}

const pool2Balances = async (api, masterChef) => {
  const calls = Array.from({ length: 9 }, (_, i) => ({ target: masterChef, params: [i] }));
  const poolsInfos = await api.multiCall({ calls, abi: abi.poolInfo })
  const pools = poolsInfos.map(({ token }) => token)

  const [token0s, token1s, balances, reserves, supplies] = await Promise.all([
    api.multiCall({ calls: pools.map((p) => ({ target: p })), abi: 'address:token0', permitFailure: true }),
    api.multiCall({ calls: pools.map((p) => ({ target: p })), abi: 'address:token1', permitFailure: true }),
    api.multiCall({ calls: pools.map((p) => ({ target: p,  params: [masterChef] })), abi: 'erc20:balanceOf', permitFailure:true }),
    api.multiCall({ calls: pools.map((p) => ({ target: p })), abi: abi.getReserves, permitFailure:true }),
    api.multiCall({ calls: pools.map((p) => ({ target: p })), abi: 'erc20:totalSupply', permitFailure:true })
  ])

  pools.forEach((_, i) => {
    const token0 = token0s[i]
    const token1 = token1s[i]
    const balance = balances[i]
    const reserve = reserves[i]
    const supply = supplies[i]
    if (!token0 || !token1 || !balance || !reserve || !supply) return

    const _balance0 = Math.round(reserve[0] * balance / supply)
    const _balance1 = Math.round(reserve[1] * balance / supply)

    api.add(token0, _balance0)
    api.add(token1, _balance1)
  })
}


module.exports = {
  pool2Balances
}