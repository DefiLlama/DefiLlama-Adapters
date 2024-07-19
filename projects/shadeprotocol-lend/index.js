const { get } = require("../helper/http")

// Total Collateral Deposited in Vaults 
async function tvl(api) {
  const data = await get('https://ruvzuawwz7.execute-api.us-east-1.amazonaws.com/prod-analytics-v1/lend')

  let totalValue = 0;

  for (let i = 0; i < data.collaterals.length; i++) {
    // Add the value of each collateral to the total value
    totalValue += data.collaterals[i].value;
  }

  return {
    tether: totalValue
  }
}

module.exports = {
  misrepresentedTokens: true,
  secret: {
    tvl
  }
}
