const { getConfig } = require('../helper/cache')

const HAI_base = '0x73e2a6320314883ff8cc08b53f1460a5f4c47f2c'.toLowerCase()

const staking = async (api) => {
  const pools = await getConfig('hackenAI', 'https://api.atomica.org/srm-production-v2/v2/pool/list')
  const owners = pools.filter(pool => pool.chainId === api.chainId && pool.capitalToken?.address.toLowerCase() === HAI_base).map(pool => pool.id)
  return api.sumTokens({ owners, token: HAI_base })
}

module.exports = {
  base: {
    tvl: () => ({}), staking,
  },
  methodology: 'We count the HAI staked in the Flash Pools contracts'
}