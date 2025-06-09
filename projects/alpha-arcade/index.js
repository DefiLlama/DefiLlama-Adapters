const { lookupApplications } = require("../helper/chain/algorand");

async function getAppState(appId) {
  const res = await lookupApplications(appId);
  return res.application.params["global-state"];
}

async function getAlphaArcadeTvl() {
    // Get all markets
    // https://g08245wvl7.execute-api.us-east-1.amazonaws.com/api/get-markets?activeOnly=true
    // Loop through each market and add it's marketAppId to an array
    let markets = [];
    let tvl = 0;
    const response = await fetch("https://g08245wvl7.execute-api.us-east-1.amazonaws.com/api/get-markets");
    if (!response.ok) {
        throw new Error(`Failed to fetch markets: ${response.statusText}`);
    }

    for (const market of response.data.markets) {
        if (market.marketAppId) {
            markets.push(market.marketAppId);
        }
    }
    
    for (const marketAppId of markets) {
        // Get application escrow account
        // Get amount of USDC in escrow account
        // Add amount to total
    }

    // Return the total as the TVL
    return tvl;
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl: async () => {
      const tvl = await getAlphaArcadeTvl();
      return tvl;
    },
  }
};