const { getResources, } = require('../helper/chain/aptos')

module.exports = {
  timetravel: false,
  aptos: {
    tvl: async (api) => {
      const data = await getResources('0xa0a017f8d8a695731dcdb8bf27e2da141da68785b347aaa5b87c5e0fa4332222')
      const engineV1Data = data.filter(i => i.type.includes('engine_v1'))
      const addresses = engineV1Data.map(i => i.type.split(', ')[1].replace('>', ''))
      addresses.forEach((addr, i) => api.add(addr, engineV1Data[i].data.total_observed_collateral,))
    }
  }
}