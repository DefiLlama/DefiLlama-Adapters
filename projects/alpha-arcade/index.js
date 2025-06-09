const { getApplicationAddress } = require("../helper/chain/algorandUtils/address");
const { lookupAccountByID } = require("../helper/chain/algorand");
const axios = require('axios');

const USDC_ASSET_ID = 31566704; // USDC asset ID on Algorand

async function getAlphaArcadeTvl() {
    // Get all markets
    // Loop through each market and add it's marketAppId to an array
    let markets = [];
    let tvl = 0;
    const response = await axios.get("https://g08245wvl7.execute-api.us-east-1.amazonaws.com/api/get-markets");
    if (!response.data || !response.data.markets) {
        throw new Error("Failed to fetch markets from Alpha Arcade API");
    }

    for (const market of response.data.markets) {
        if (market.marketAppId) {
            markets.push(market.marketAppId);
        }
    }

    for (const marketAppId of markets) {
        try {
            // Get application escrow account
            const appAddress = await getApplicationAddress(marketAppId);

            // Get amount of USDC in escrow account
            const addressData = await lookupAccountByID(appAddress);

            // Add amount to total tvl
            const assets = addressData.account.assets;
            if (assets) {
                for (const asset of assets) {
                    if (asset['asset-id'] === USDC_ASSET_ID) {
                        tvl += asset.amount;
                    }
                }
            }
        } catch (err) {
            // No active escrow account for this market
            continue;
        }
    }
    return tvl / 1e6; // Convert from micro USDC to USDC
}

module.exports = {
  methodology: 'TVL represents the total amount USDC held in escrow across all markets on Alpha Arcade.',
  timetravel: false,
  algorand: {
    tvl: getAlphaArcadeTvl,
  }
};