/**
 *
 * @type {[{vaultID: number, assetDecimals: number, depositAssetID: number},{vaultID: number, assetDecimals: number, depositAssetID: number}]}
 */
const vaults = [
    {
        vaultID: 114307159,
        depositAssetID: 88808685,
        assetDecimals: 6,
    },
    {
        vaultID: 114308686,
        depositAssetID: 88808609,
        assetDecimals: 6,
    },
    {
        vaultID: 114401737,
        depositAssetID: 0,
        assetDecimals: 6,
    },
];

/**
 * @desc Key - Deposit ID
 * @desc Value - Medianizer Contract ID
 *
 * @type {{"deposit id": "medianizer id"}}
 */
const price_feeds = {
    0: 111693934,
    88808685: 111693486,
    88808609: 111692924,
}

const priceDecimals = 6;

module.exports = {
    vaults,
    price_feeds,
    priceDecimals
};
