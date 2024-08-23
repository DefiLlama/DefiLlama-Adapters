const { get } = require('../helper/http')
const { getConfig } = require('../helper/cache')

const positionManager = '0x0b95Ea9Eb46716d20991163AE60eD2e16645Ef38';
const getValueFarmAbi = 'function getFarmValue(address) view returns (address token0, uint256 amount0, address token1, uint256 amount1)';
const OPEN = '0x58cb98a966f62aa6f2190eb3aa03132a0c3de3d5'

async function tvl(api) {
  const vaults = await getConfig('open-world/lev-farming-vaults/'+api.chain, undefined, {
    fetcher: async () => {
      const data = await get('https://analytic.ow.finance/lending-synthetic')
      return data.data.map(v => v.vaultAddress)
    }
  })
  const farms = await getConfig('open-world/lev-farming-farms/'+api.chain, undefined, {
    fetcher: async () => {
      const data = await get('https://product-exploration.ow.finance/pools')
      return data.data.map(v => v.workerAddress)
    }
  })
  const tokens = await api.multiCall({ abi: 'address:token', calls: vaults })
  await api.sumTokens({ tokensAndOwners2: [tokens, vaults], })
  const farmData = await api.multiCall({  abi: getValueFarmAbi, calls: farms, target: positionManager })
  for (const i of farmData) {
    api.add(i.token0, i.amount0)
    api.add(i.token1, i.amount1)
  }

  api.removeTokenBalance(OPEN)
}

module.exports = {
  arbitrum: { tvl },
}