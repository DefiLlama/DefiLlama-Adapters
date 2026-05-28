const VAULTS = [
    "0x9271A5C684330B2a6775e96B3C140FC1dC3C89be",
    "0xaEAAD6d9B096829E5F3804a747C9FDD6677d78f0",
    "0x72EE42bd660e4f676106C3718b00af06257c9d35",
    "0x7f2b789Ac6D93521FAe86Cbc838eFcfc4F2b004B",
    "0x5743AeC1f06E896544D1638E0FEBd15098855CB5",
    "0x4d0fF6a0DD9f7316b674Fb37993A3Ce28BEA340e",
];

async function tvl(api) {
    return api.erc4626Sum({ calls: VAULTS, permitFailure: false, tokenAbi: 'address:asset', balanceAbi: 'totalAssets' });
}

module.exports = {
    hyperliquid: {
        tvl,
    },
    doublecounted: true,
    methodology: "Gets the assets deposited across all vaults.",
};
