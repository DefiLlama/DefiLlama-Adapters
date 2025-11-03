const stickyFactory = '0x18B9ABf2E821E2fE7A08Dc255d5a7e77fFc0b844'
const autoWinFactory = '0x21b35a3dcF462540cb8EEA0e5d8594FF9e93C2e1'

const abis = {
  getDeployers: 'address[]:getDeployers',
  getStickyVault: 'function getStickyVaults(address deployer) view returns (address[])',
  getAutoWinVaults: 'function getAutoWinVaults(address deployer) view returns (address[])',
  getUnderlyingBalances: 'function getUnderlyingBalances() view returns (uint256 amount0Current, uint256 amount1Current)',
  token0: 'address:token0',
  token1: 'address:token1',
}

const stickyVaultsTVL = async (api) => {
  const deployers = await api.call({ target: stickyFactory, abi: abis.getDeployers })
  const stickyVaults = (await api.multiCall({ calls: deployers, target: stickyFactory, abi: abis.getStickyVault })).flat()

  const [token0s, token1s, balances] = await Promise.all([
    api.multiCall({ calls: stickyVaults, abi: abis.token0, permitFailure: true }),
    api.multiCall({ calls: stickyVaults, abi: abis.token1, permitFailure: true }),
    api.multiCall({ calls: stickyVaults, abi: abis.getUnderlyingBalances, permitFailure: true })
  ])

  stickyVaults.forEach((_, i) => {
    const token0 = token0s[i]
    const token1 = token1s[i]
    const balance = balances[i]
    if (!token0 || !token1 || !balance) return
    const { amount0Current, amount1Current } = balance
    api.add(token0, amount0Current)
    api.add(token1, amount1Current)
  })
}

const autoWinVaultsTVL = async (api) => {
  const deployers = await api.call({ target: autoWinFactory, abi: abis.getDeployers })
  const autoWinVaults = (await api.multiCall({ calls: deployers, target: autoWinFactory, abi: abis.getAutoWinVaults })).flat()

  const [token0s, token1s, balances] = await Promise.all([
    api.multiCall({ calls: autoWinVaults, abi: abis.token0, permitFailure: true }),
    api.multiCall({ calls: autoWinVaults, abi: abis.token1, permitFailure: true }),
    api.multiCall({ calls: autoWinVaults, abi: abis.getUnderlyingBalances, permitFailure: true })
  ])

  autoWinVaults.forEach((_, i) => {
    const token0 = token0s[i]
    const token1 = token1s[i]
    const balance = balances[i]
    if (!token0 || !token1 || !balance) return
    const { amount0Current, amount1Current } = balance
    api.add(token0, amount0Current)
    api.add(token1, amount1Current)
  })
}

const { uniV3Export } = require('../helper/uniswapV3');
const { mergeExports } = require('../helper/utils')

const uniExports = uniV3Export({
  berachain: { 
    factory: '0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63', 
    fromBlock: 2500000, // Reduced to capture earlier pools including NECT-HONEY
  },
})

const vaultsTVL = async (api) => {
  await Promise.all([
    stickyVaultsTVL(api),
    autoWinVaultsTVL(api),
  ])
}

module.exports = mergeExports([{
  berachain: { tvl: vaultsTVL }
}, uniExports])
