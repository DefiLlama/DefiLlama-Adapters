const { post } = require('../helper/http')

const url = "https://api.web3.world/v2/pools"

const payload = {
  limit: 1000,
  offset: 0,
  ordering: "tvldescending",
  whiteListUri: "https://static.web3.world/assets/manifest.json"
}

const tvl = async (api) => {
  const { pools } = await post(url, payload)
  pools.forEach(({ tvl }) => {
    api.addUSDValue(Math.round(tvl))
  })
}

module.exports = {
  misrepresentedTokens: true,
  venom: { tvl }
};
