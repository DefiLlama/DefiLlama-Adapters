const { getConfig } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  polygon: ADDRESSES.polygon.USDC_CIRCLE,
}

async function getContracts() {
  const [list0Res, list1Res] = await Promise.all([
    getConfig('betfolio', 'https://api.betfolio.co/api/v1/user/predictionList?limit=1000&duration=&type='),
    getConfig('betfolioSoloPrediction', 'https://api.betfolio.co/api/v1/user/getSoloPredictions?limit=1000&type=All&theme=All&solo_type=All')
  ]);
  return [...list0Res.data.list, ...list1Res.data.list].map(i => i.contract_address)
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const owners = await getContracts(api)
      return api.sumTokens({ owners, tokens: [config[chain]] })
    }
  }
})