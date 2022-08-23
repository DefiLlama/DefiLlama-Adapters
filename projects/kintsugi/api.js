
const { getAPI } = require('../helper/acala/api')

module.exports = {
  kintsugi: { tvl: async () => {
    const api = await getAPI('kintsugi')
    const data = await api.query.vaultRegistry.totalUserVaultCollateral.entries()
    return {
      kusama: data[1][1] / 1e12
    }
  }},
};