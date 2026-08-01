const { getApplicationAddress } = require("../helper/chain/algorandUtils/address");
const { lookupAccountByID, lookupApplicationsCreatedByAccount } = require("../helper/chain/algorand");
const axios = require('axios');
const { getCachedPrices } = require('../folks-xalgo/prices');
const { lookupApplications } = require("../helper/chain/algorand");

const USDC_ASSET_ID = 31566704; // USDC asset ID on Algorand


async function getAlphaArcadeMarkets() {
    const response = await axios.get("https://g08245wvl7.execute-api.us-east-1.amazonaws.com/api/get-markets");
    if (!response.data || !response.data.markets) {
        throw new Error("Failed to fetch markets from Alpha Arcade API");
    }
    return response.data.markets;
}

async function getMarketTvl(marketAppId) {
    let marketMatchedOrderTvl = 0;
    let marketOpenOrderTvl = 0;

    try {
        // Get USDC in escrow account for matched orders
        const marketAppAddress = getApplicationAddress(marketAppId);
        const addressData = await lookupAccountByID(marketAppAddress);
        const assets = addressData.account.assets;
        if (assets) {
            for (const asset of assets) {
                if (asset['asset-id'] === USDC_ASSET_ID) {
                    marketMatchedOrderTvl += asset.amount;
                }
            }
        }
        
        // Get open orders created by the market app
        const createdApplications = await lookupApplicationsCreatedByAccount(marketAppAddress);
        for (const app of createdApplications.applications) {
            const appAddress = getApplicationAddress(app.id);
            const appData = await lookupAccountByID(appAddress);
            const assets = appData.account.assets;
            if (assets) {
                for (const asset of assets) {
                    if (asset['asset-id'] === USDC_ASSET_ID) {
                        // Buy order
                        marketOpenOrderTvl += asset.amount;
                    } else if (asset['asset-id'] !== USDC_ASSET_ID && asset.amount > 0) {
                        // Sell order
                        const globalState = await lookupApplications(app.id);
                        const price = globalState.application.params['global-state'].find(item => {
                            const decodedKey = Buffer.from(item.key, 'base64').toString('utf-8');
                            return decodedKey === 'price';
                        });
                        if (price) {
                            marketOpenOrderTvl += ((asset.amount / 1e6) * (price.value.uint / 1e6)) * 1e6;
                        }
                    }
                }
            }
        }
    }
    catch (err) {
        // No active escrow account for this market
        return 0;
    }

    return marketMatchedOrderTvl + marketOpenOrderTvl;
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
    let tvlUSD = 0;
    const markets = await getAlphaArcadeMarkets();

    for (const market of markets) {
        const marketAppId = market.marketAppId;

        if (market.options && market.options.length > 1) {
            // Multi-option market: sum TVL for all options and include each option's TVL
            for (const option of market.options) {
                if (!option.marketAppId) continue;
                const optionTvl = await getMarketTvl(option.marketAppId);
                tvlUSD += optionTvl;
            }
        } else {
            // Single market
            const marketTvl = await getMarketTvl(marketAppId);
            tvlUSD += marketTvl;
        }
    }

    return tvlUSD / 1e6; // Convert from microUSDC
}


module.exports = {
  methodology: 'TVL represents the total value held in escrow across all markets for open and matched orders on Alpha Arcade.',
  timetravel: false,
  algorand: {
    tvl: async () => {
        const prices = await getCachedPrices();
        const algoPrice = prices['0'] * 1e6; // Algo Asset Id is 0

        const tvlUSD = await getAlphaArcadeTvl(); // Total TVL in USDC from Alpha Arcade

        const tvlAlgo = tvlUSD / algoPrice; // Convert USDC to Algo using the price of Algo

        return { algorand: tvlAlgo };
    }
  }
};