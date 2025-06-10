const { getApplicationAddress } = require("../helper/chain/algorandUtils/address");
const { lookupAccountByID, lookupApplicationsCreatedByAccount } = require("../helper/chain/algorand");
const axios = require('axios');
const { getCachedPrices } = require('../folks-xalgo/prices');

const USDC_ASSET_ID = 31566704; // USDC asset ID on Algorand


async function getAlphaArcadeMarkets() {
    const response = await axios.get("https://g08245wvl7.execute-api.us-east-1.amazonaws.com/api/get-markets");
    if (!response.data || !response.data.markets) {
        throw new Error("Failed to fetch markets from Alpha Arcade API");
    }
    return response.data.markets;
}

/**
 * Fetches the TVL in USDC held in escrow accounts across all markets on Alpha Arcade.
 * This function retrieves the market data from the Alpha Arcade API, calculates the 
 * total value locked (TVL) by summing the USDC balances in both matched and open orders.
 *
 * @async
 * @function getAlphaArcadeTvl
 * @returns {Promise<number>} The total TVL in USDC across all matched markets.
 * @throws {Error} If the markets cannot be fetched from the Alpha Arcade API.
 */
async function getAlphaArcadeTvl() {
    let openOrderTvl = 0;
    let matchedOrderTvl = 0;
    const markets = await getAlphaArcadeMarkets();

    for (const market of markets) {
        if (!market.marketAppId) continue;
        const marketAppId = market.marketAppId;

        try {
            // Get application escrow account
            const marketAppAddress = getApplicationAddress(marketAppId);

            // Get amount of USDC in escrow account
            const addressData = await lookupAccountByID(marketAppAddress);

            // Add amount to total tvl in USD
            const assets = addressData.account.assets;
            if (assets) {
                for (const asset of assets) {
                    if (asset['asset-id'] === USDC_ASSET_ID) {
                        matchedOrderTvl += asset.amount;
                    }
                }
            }


            // For each created application, find application address and add its USDC balance
            const createdApplications = await lookupApplicationsCreatedByAccount(marketAppAddress);
            for (const app of createdApplications.applications) {
                const appAddress = getApplicationAddress(app.id);
                const appData = await lookupAccountByID(appAddress);
                const assets = appData.account.assets;
                if (assets) {
                    for (const asset of assets) {
                        if (asset['asset-id'] === USDC_ASSET_ID) {
                            openOrderTvl += asset.amount;
                        }
                    }
                }
            }

        } catch (err) {
            // No active escrow account for this market
            continue;
        }
    }
    const tvlUSD = matchedOrderTvl + openOrderTvl;
    return tvlUSD / 1e6; // Convert from microUSDC
}


module.exports = {
  methodology: 'TVL represents the total amount USDC held in escrow across all markets on Alpha Arcade.',
  timetravel: false,
  algorand: {
    tvl: async () => {
        const prices = await getCachedPrices();
        const algoPrice = prices['0'] * 1e6; // Algo Asset Id is 0

        const tvlUSD = await getAlphaArcadeTvl(); // Total TVL in USD from Alpha Arcade

        const tvlAlgo = tvlUSD / algoPrice; // Convert USDC to Algo using the price of Algo

        return { algorand: tvlAlgo };
    }
  }
};