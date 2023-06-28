const axios = require("axios");
const BigNumber = require("bignumber.js");

const mangoGroupId = "78b8f4cGCwmZ9ysPFMWLaLTkkaYnUjwMJYStWe5RTSSX";
const statsEndpoint =
    "https://api.mngo.cloud/data/v4/token-historical-stats?mango-group=" +
    mangoGroupId;
const metadataEndpoint = "https://api.mngo.cloud/data/v4/group-metadata";

// Very inefficient
function findClosestToDate(values, date) {
    let min = values[values.length - 1];
    for (const val of values) {
        const valDate = new Date(val.date_hour).getTime();
        const minDate = new Date(min.date_hour).getTime();
        if (Math.abs(valDate - date) < Math.abs(minDate - date)) {
            min = val;
        }
    }
    if (Math.abs(new Date(min.date_hour).getTime() - date) > 24 * 3600 * 1000) {
        return {
            total_deposits: 0,
            total_borrows: 0,
        };
    }
    return min;
}

async function tvl(timestamp) {
    const balances = {};
    const stats = await axios.get(statsEndpoint);
    const metadata = await axios.get(metadataEndpoint);

    const groupMetadata = metadata.data.groups.find(
        (g) => g.publicKey == mangoGroupId
    );

    const date = new Date(timestamp * 1000).getTime();
    groupMetadata.tokens.forEach((token) => {
        const assetDeposits = stats.data.filter((s) => s.symbol === token.symbol);
        if (assetDeposits.length > 0) {
            const closestVal = findClosestToDate(assetDeposits, date);
            const nativeBalance = new BigNumber(
                (closestVal.total_deposits * Math.pow(10, token.decimals)).toFixed(0)
            );
            balances["solana:" + token.mint] = nativeBalance;
        }
    });

    return balances;
}

module.exports = {
    // stats api only returns 30 days of data
    timetravel: false,
    solana: {
        tvl: tvl,
    },
    hallmarks: [
        [1665521360, "Oracle Price Manipulation"],
    ],
};
