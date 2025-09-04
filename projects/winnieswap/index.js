const winnieFactory = '0x18B9ABf2E821E2fE7A08Dc255d5a7e77fFc0b844'

const abis = {
  token0: 'address:token0',
  token1: 'address:token1',
  getDeployers: 'address[]:getDeployers',
  getStickyVault: 'function getStickyVault(address deployer) view returns (address[])',
  getUnderlyingBalances: 'function getUnderlyingBalances() view returns (uint256 amount0Current, uint256 amount1Current)'
}

const tvl = async (api) => {
  const deployers = await api.call({ target: winnieFactory, abi: abis.getDeployers })
  const stickyvaults = (await api.multiCall({ calls: deployers.map((d) => ({ target: winnieFactory, params: [d] })), abi: abis.getStickyVault })).flat()

  const [token0s, token1s, balances] = await Promise.all([
    api.multiCall({ calls: stickyvaults, abi: abis.token0, permitFailure: true }),
    api.multiCall({ calls: stickyvaults, abi: abis.token1, permitFailure: true }),
    api.multiCall({ calls: stickyvaults, abi: abis.getUnderlyingBalances, permitFailure: true })
  ])

  stickyvaults.forEach((_, i) => {
    const token0 = token0s[i]
    const token1 = token1s[i]
    const balance = balances[i]
    if (!token0 || !token1 || !balance) return
    const { amount0Current, amount1Current } = balance
    api.add(token0, amount0Current)
    api.add(token1, amount1Current)
  })
}

module.exports = {
  berachain: { tvl }
}
