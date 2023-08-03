/**
 *
 * @type {[{vaultID: number, stable: boolean, assetDecimals: number, depositAssetID: number},{vaultID: number, stable: boolean, assetDecimals: number, depositAssetID: number},{vaultID: number, stable: boolean, assetDecimals: number, depositAssetID: number}]}
 */
const vaults = [
    // v1.0
    {
        vaultID: 878144513,
        assetDecimals: 6,
        coingecko: 'algorand',
    },
    {
        vaultID: 878140320,
        assetDecimals: 6,
        coingecko: 'usd-coin',
    },
    // v1.1
    {
        vaultID: 919531421,
        assetDecimals: 6,
        coingecko: 'algorand',
    },
    {
        vaultID: 919539218,
        assetDecimals: 6,
        coingecko: 'usd-coin',
    },
    {
        vaultID: 1004309470,
        assetDecimals: 8,
        coingecko: 'bitcoin',
    },
    {
        vaultID: 1004325987,
        assetDecimals: 6,
        coingecko: 'usd-coin',
    },
    {
        vaultID: 1004326861,
        assetDecimals: 8,
        coingecko: 'ethereum',
    },
    {
        vaultID: 1004374058,
        assetDecimals: 6,
        coingecko: 'usd-coin',
    },
    {
        vaultID: 1097368119,
        assetDecimals: 4,
        coingecko: 'pepe',
    },
];


module.exports = {
    vaults,
};
