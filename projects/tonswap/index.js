const { post } = require('../helper/http')

const url = 'https://api.flatqube.io/v1/pairs'

const payload = {
  currencyAddresses: [],
  limit: 1000,
  offset: 0,
  ordering: "tvldescending",
  whiteListUri: "https://raw.githubusercontent.com/broxus/flatqube-assets/master/manifest.json",
}

const tvl = async (api) => {
  const { pairs } = await post(url, payload)
  pairs.forEach(( { tvl }) => {
    api.addUSDValue(Math.round(tvl))
  })
}

module.exports = {
  misrepresentedTokens: true,
  everscale: { tvl }
};
