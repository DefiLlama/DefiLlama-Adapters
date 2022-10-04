const {
    price_feeds,
    priceDecimals
} = require("./constants");
const {
    readGlobalState, medianFromArray
} = require("./utils");


async function getTellorPrice(medianizerAppID) {
    const state = await readGlobalState(medianizerAppID,
        ["median_value_1", "median_value_2", "median_value_3", "median_value_4", "median_value_5"]
    );
    return medianFromArray(state)
}

async function getPrices() {
    const prices = {};

    let price;
    for (const [depositID, medianizerID] of Object.entries(price_feeds)) {
        price = await getTellorPrice(medianizerID)
        prices[depositID] = Number(price) / 10 ** priceDecimals;
    }

    return prices;
}

module.exports = {getPrices};
