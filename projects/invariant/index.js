const { sumTokens2 } = require('../helper/solana')
const { getConfig } = require('../helper/cache')

const config = {
  solana: 'J4uBbeoWpZE8fH58PM1Fp9n9K6f1aThyeVCyRdJbaXqt',
  eclipse: 'D4P9HJYPczLFHvxBgpLKooy7eWczci8pr4x9Zu7iYCVN',
}

module.exports = {
  timetravel: false,
  methodology: "TVL is a sum of the locked capital in each liquidity pool",
};

const tvl = async (api) => {
  if (api.chain !== 'eclipse') return sumTokens2({ owner: config[api.chain], api })
  const { tokensData } = await getConfig('invariant/eclipse', 'https://stats.invariant.app/svm/full_snap/eclipse-mainnet')
  const tokens = tokensData.map(t => t.address)
  return sumTokens2({ owner: config[api.chain], tokens, api })
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})