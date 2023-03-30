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
        stable: true,
    },
    {
        vaultID: 1004309470,
        depositAssetID: 386192725,
        assetDecimals: 8,
        coingecko: 'bitcoin',
        stable: false,
    },
    {
        vaultID: 1004325987,
        depositAssetID: 31566704,
        assetDecimals: 6,
        coingecko: 'usd-coin',
        stable: true,
    },
    {
        vaultID: 1004326861,
        depositAssetID: 386195940,
        assetDecimals: 8,
        coingecko: 'ethereum',
        stable: false,
    },
    {
        vaultID: 1004374058,
        depositAssetID: 31566704,
        assetDecimals: 6,
        coingecko: 'usd-coin',
        stable: true,
    },
];

const state = {
    ethereum: {
        contractAddress: "0x2103dE019522B65BbbD051C8Ce9426AA9005A655",
        tokens: [
            {
                name: "usd-coin",
                address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                decimals: 6
            },
        ]
    },
}

module.exports = {
    vaults,
    state
};
