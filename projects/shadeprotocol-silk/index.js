const { get } = require("../helper/http")

async function tvl(_, _b, _cb, { api, }) {
  const data = await get('https://ruvzuawwz7.execute-api.us-east-1.amazonaws.com/prod-analytics-v1/silk')
  return {
    tether: data.totalUsd
  }
}

module.exports = {
  misrepresentedTokens: true,
  secret: {
    tvl
  }
}