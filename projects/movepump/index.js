const { getResources } = require('../helper/chain/aptos')
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const resources = await getResources("0x766ec6a18eed729b6b62f8af38f7a62dbc847b84bec29063c8b0d46830a82401")
  resources.forEach((resource) => {
    if (resource.type.includes('movepump_launch::Pool<')) {
      api.add(ADDRESSES.aptos.APT, resource.data.real_aptos_reserves.value)
    }
  })
}

module.exports = {
  aptos: { tvl }
}