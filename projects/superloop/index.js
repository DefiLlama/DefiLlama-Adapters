const CONFIGS = require("./config");

const userReserveDataAbi = "function getUserReserveData(address asset, address user) external view override returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)";

async function tvl(api) {
    const config = CONFIGS[api.chain];

    for (let i = 0; i < config.VAULTS.length; i++) {
        const vault = (!api.block || api.block > config.MIGRATION_BLOCKS[i]) ? config.VAULTS[i] : config.V1_VAULTS[i];
        const { lend } = config.VAULT_TOKENS[vault];

        const reserveData = await api.multiCall({
            abi: userReserveDataAbi,
            target: config.SUPERLEND_PROTOCOL_DATA_PROVIDER,
            calls: lend.map(token => ({ params: [token, vault] })),
        });

        reserveData.forEach((data, j) => api.add(lend[j], data.currentATokenBalance ?? 0));
        await api.sumTokens({ tokens: config.UNDERLYING_TOKENS, owners: [vault] });
    }
}

async function borrowed(api) {
    const config = CONFIGS[api.chain];

    for (let i = 0; i < config.VAULTS.length; i++) {
        const vault = (!api.block || api.block > config.MIGRATION_BLOCKS[i]) ? config.VAULTS[i] : config.V1_VAULTS[i];
        const { borrow } = config.VAULT_TOKENS[vault];

        const reserveData = await api.multiCall({
            abi: userReserveDataAbi,
            target: config.SUPERLEND_PROTOCOL_DATA_PROVIDER,
            calls: borrow.map(token => ({ params: [token, vault] })),
        });

        reserveData.forEach((data, j) => api.add(borrow[j], data.currentVariableDebt ?? 0));
    }
}

module.exports = {
    etlk: { tvl, borrowed },
    ethereum: { tvl, borrowed },
}
