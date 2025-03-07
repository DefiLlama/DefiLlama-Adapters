const { getConfig } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')

const USDC = ADDRESSES.polygon.USDC_CIRCLE

const tvl = async (api) => {
  const [list0Res,list1Res] = await Promise.all([
    getConfig('betfolio', 'https://api.betfolio.co/api/v1/user/predictionList?limit=1000&duration=&type='),
    getConfig('betfolioSoloPrediction', 'https://api.betfolio.co/api/v1/user/getSoloPredictions?limit=1000&type=All&theme=All&solo_type=All')
  ])

  const owners = [...list0Res.data.list, ...list1Res.data.list].map(
    (i) => i.contract_address
    .includes('_') ? i.contract_address
    .split('_')[0] : i.contract_address
  );

  return api.sumTokens({ owners, tokens: [USDC] })
}

module.exports = {
  polygon: { tvl }
}