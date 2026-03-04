const { getConfig } = require('../helper/cache')

async function tvl(api) {
  const config = await getConfig('ample-money', 'https://api.ample.money/trpc/vault.getVaults')
  const vaults = config.result.data.vaults.filter(i => i.chainId === api.chainId).map(i => i.address)
  return api.erc4626Sum2({ calls: vaults })
}

module.exports = {
  doublecounted: true,
}

const chains = ['katana', 'arbitrum', 'base']

chains.forEach(chain => {
  module.exports[chain] = {
    tvl,
  }
})