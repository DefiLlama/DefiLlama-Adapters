const {
    price_feeds,
    priceDecimals
} = require("./constants");
const {
    readGlobalState, medianFromArray
} = require("./utils");


/**
 * @desc Get price from medianizer contract
 *
 * @param medianizerAppID
 * @returns {Promise<number|*>}
 */
async function getPriceFromMedianizer(medianizerAppID) {
    const state = await readGlobalState(medianizerAppID,
        ["median_value_1", "median_value_2", "median_value_3", "median_value_4", "median_value_5"]
    );
    return medianFromArray(state)
}

/**
 * @desc Get prices object with deposit asset index
 *
 * @returns {Promise<{}>}
 */
async function getPrices() {
    const prices = {};

    let price;
    for (const [depositAssetID, medianizerID] of Object.entries(price_feeds)) {
        price = await getPriceFromMedianizer(medianizerID)
        prices[depositAssetID] = Number(price) / 10 ** priceDecimals;
    }

    return prices;
}

module.exports = {getPrices};
