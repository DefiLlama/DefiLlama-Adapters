const sdk = require("@defillama/sdk");
const config = require("./config");

async function tvl(api) {
    const balances = {};
    
    const userReserveData = await api.call({
        abi: "function getUserReserveData(address asset, address user) external view override returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)",
        target: config.SUPERLEND_PROTOCOL_DATA_PROVIDER,
        params: [config.STXTZ, config.SUPERLOOP_VAULT],
    });

    sdk.util.sumSingleBalance(balances, config.STXTZ, userReserveData?.currentATokenBalance ?? '0', api.chain);

    return balances;
}

module.exports = {
    etlk: { tvl }
}
