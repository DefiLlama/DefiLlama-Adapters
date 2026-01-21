/**
 * PagCrypto - Volume (TTV proxy) config
 * Volume definition: sum of stablecoin inflows (USDC/USDT) to PagCrypto receiver wallet (EVM) per day.
 */

module.exports = {
    project: "pagcrypto",

    receiver: {
        evm: "0xC8e3BC38C3e4D768f83a1a064BdE4045aFf3158C",
    },

    chains: {
        // active now
        polygon: { status: "active" },
        base: { status: "active" },

        // soon
        ethereum: { status: "soon" },
        arbitrum: { status: "soon" },
        optimism: { status: "soon" },
    },

    // Stablecoins used as USD proxy (no price oracle needed)
    stablecoins: {
        ethereum: [
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
            "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        ],
        polygon: [
            "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
            // add USDT polygon if you want, once confirmed
        ],
        base: [
            "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC (Base)
        ],
        arbitrum: [
            "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC (native)
            "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
        ],
        optimism: [
            "0x0b2c639c533813f4aa9d7837caf62653d097ff85", // USDC
            "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", // USDT
        ],
    },
};
