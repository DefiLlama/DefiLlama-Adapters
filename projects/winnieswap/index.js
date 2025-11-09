const stickyFactory = '0x18B9ABf2E821E2fE7A08Dc255d5a7e77fFc0b844'

const abis = {
  getDeployers: 'address[]:getDeployers',
  getStickyVault: 'function getStickyVaults(address deployer) view returns (address[])',
}

const akkarisTVL = async (api) => {
  const deployers = await api.call({ target: stickyFactory, abi: abis.getDeployers })
  const stickyVaults = (await api.multiCall({ calls: deployers, target: stickyFactory, abi: abis.getStickyVault })).flat()

  const [token0s, token1s,] = await Promise.all([
    api.multiCall({ calls: stickyVaults, abi: 'address:token0', }),
    api.multiCall({ calls: stickyVaults, abi: 'address:token1', }),
  ])
  const tokensAndOwners2 = [token0s.concat(token1s), stickyVaults.concat(stickyVaults)]
  return api.sumTokens({ tokensAndOwners2 })
}

const { uniV3Export } = require('../helper/uniswapV3');
const { mergeExports } = require('../helper/utils')

const uniExports = uniV3Export({
  berachain: { factory: '0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63', fromBlock: 2500000 },
})

module.exports = mergeExports([{
  berachain: { tvl: akkarisTVL }
}, uniExports])
