const { getApplicationAddress } = require("../helper/chain/algorandUtils/address");
const { lookupAccountByID } = require("../helper/chain/algorand");

const USDC_ASSET_ID = 31566704; // USDC asset ID on Algorand

async function getAlphaArcadeTvl() {
    // Get all markets
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
        // Add amount to total tvl
        getApplicationAddress(marketAppId).then((account) => {
                lookupAccountByID(account).then((accountData) => {
                    const assets = accountData.account.assets;
                    if (assets) {
                        for (const asset of assets) {
                            if (asset['asset-id'] === USDC_ASSET_ID) {
                                tvl += asset.amount;
                            }
                        }
                    }
                });
            })
        
    }

    return tvl; // Currently in micro USDC
}

module.exports = {
  methodology: 'TVL is the total quantity of unclaimed USDC held in escrow accounts of all the markets on Alpha Aracde.',
  timetravel: false,
  algorand: {
    tvl: async () => {
      const tvl = await getAlphaArcadeTvl();
      return tvl;
    },
  }
};