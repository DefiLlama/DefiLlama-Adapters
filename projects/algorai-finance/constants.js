/**
 *
 * @type {[{vaultID: number, stable: boolean, assetDecimals: number, depositAssetID: number},{vaultID: number, stable: boolean, assetDecimals: number, depositAssetID: number},{vaultID: number, stable: boolean, assetDecimals: number, depositAssetID: number}]}
 */
const vaults = [
    {
        vaultID: 878144513,
        depositAssetID: 0,
        assetDecimals: 6,
        coingecko: 'algorand',
        stable: false
    },
    {
        vaultID: 878140320,
        depositAssetID: 31566704,
        assetDecimals: 6,
        coingecko: 'usd-coin',
        stable: true
    },
];

/**
 * @desc Key - Deposit ID
 * @desc Value - Medianizer Contract ID
 *
 * @type {{"deposit id": "medianizer id"}}
 */
const price_feeds = {
    0: 879224867,
}

const priceDecimals = 6;

module.exports = {
    vaults,
    price_feeds,
    priceDecimals
};
