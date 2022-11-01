/**
 *
 * @type {[{vaultID: number, stable: boolean, assetDecimals: number, depositAssetID: number},{vaultID: number, stable: boolean, assetDecimals: number, depositAssetID: number},{vaultID: number, stable: boolean, assetDecimals: number, depositAssetID: number}]}
 */
const vaults = [
    // v1.0
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
    // v1.1
    {
        vaultID: 919531421,
        depositAssetID: 0,
        assetDecimals: 6,
        coingecko: 'algorand',
        stable: false
    },
    {
        vaultID: 919539218,
        depositAssetID: 31566704,
        assetDecimals: 6,
        coingecko: 'usd-coin',
        stable: true
    },
];

module.exports = {
    vaults,
};
