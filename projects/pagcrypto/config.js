/**
 * PagCrypto
 * Payments infrastructure – no TVL, no escrow.
 * Metrics tracked: on-chain proxy for Volume (TTV) and Fees.
 */

module.exports = {
    project: "pagcrypto",

    chains: {
        solana: {
            status: "active",
            wallet: "5XvzUs92L7G4picBJchfatM25RcR93oE3h8xGRZe7462",
        },

        tron: {
            status: "active",
            wallet: "TA9Xywe3xb6GPeBFYDdTkdT43DktDPnyDT",
        },

        ethereum: {
            status: "soon",
            wallet: "0xC8e3BC38C3e4D768f83a1a064BdE4045aFf3158C",
        },

        polygon: {
            status: "active",
            wallet: "0xC8e3BC38C3e4D768f83a1a064BdE4045aFf3158C",
        },

        arbitrum: {
            status: "soon",
            wallet: "0xC8e3BC38C3e4D768f83a1a064BdE4045aFf3158C",
        },

        optimism: {
            status: "soon",
            wallet: "0xC8e3BC38C3e4D768f83a1a064BdE4045aFf3158C",
        },

        base: {
            status: "active",
            wallet: "0xC8e3BC38C3e4D768f83a1a064BdE4045aFf3158C",
        },

        xrpl: {
            status: "active",
            wallet: "r421rbtEZxdniuMmKbq7qzFNnxxHssVYn6",
            unsupported_here: true
        },

        toncoin: {
            status: "active",
            wallet: "UQBYm7IGk0XmqcwRDHm9vtJWu05im1P3zU7pJYCnG8rymMxf",
            unsupported_here: true
        },
    },

    /**
     * Definition used for volume:
     * - Sum of on-chain transfers received by PagCrypto wallets
     * - Measured per day, per chain
     *
     * This is NOT TVL.
     */
};
