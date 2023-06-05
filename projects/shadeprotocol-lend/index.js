const { get } = require("../helper/http")

// Total Collateral Deposited in Vaults + Silk in Earn Pool
async function tvl(_, _b, _cb, { }) {
  const data = await get('https://ruvzuawwz7.execute-api.us-east-1.amazonaws.com/prod-analytics-v1/lend')
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