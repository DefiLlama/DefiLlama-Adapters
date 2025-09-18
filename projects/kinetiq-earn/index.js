const VAULT = {
    boring_vault: "0x9BA2EDc44E0A4632EB4723E81d4142353e1bB160",
    accountant_with_rate_providers: "0x74392Fa56405081d5C7D93882856c245387Cece2",
    lens: "0x5232bc0F5999f8dA604c42E1748A13a170F94A1B",
    deployed_at: 8440831,
};

async function tvl(api) {
    const block = await api.getBlock();

    if (block < VAULT.deployed_at) return {};

    const { asset, assets } = await api.call({
        target: VAULT.lens,
        params: [VAULT.boring_vault, VAULT.accountant_with_rate_providers],
        abi: "function totalAssets(address boringVault, address accountant) view returns (address asset, uint256 assets)",
    });

    api.add(asset, assets);
}

module.exports = {
    timetravel: true,
    hyperliquid: { tvl }
};
