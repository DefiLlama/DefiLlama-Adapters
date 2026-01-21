/**
 * PagCrypto - DefiLlama Volume + Fees config
 * PagCrypto não tem TVL/escrow; usamos TTV (volume) e fees.
 *
 * Chains:
 * - active: operando agora
 * - soon: em breve (retorna 0 até ativar)
 */

module.exports = {
    project: "pagcrypto",

    chains: {
        solana: {
            status: "active",
            wallet: "5XvzUs92L7G4picBJchfatM25RcR93oE3h8xGRZe7462",
        },
        xrpl: {
            status: "active",
            wallet: "9r421rbtEZxdniuMmKbq7qzFNnxxHssVYn6",
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
    },

    /**
     * Onde o adapter vai buscar os números consolidados (volume/fees)
     * Você vai apontar isso para o seu BFF Fastify.
     */
    api: {
        baseUrl: "https://api.pagcrypto.app/api",
        endpoints: {
            volume: "/defillama/volume",
            fees: "/defillama/fees",
        },
    },
};
