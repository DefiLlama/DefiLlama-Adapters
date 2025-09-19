const sdk = require("@defillama/sdk");
const config = require("./config");

const userReserveDataAbi = "function getUserReserveData(address asset, address user) external view override returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)";

async function tvl(api) {
    const balances = {};
    
    const [userReserveDataLend, cashReserve] = await Promise.all([
        api.call({
            abi: userReserveDataAbi, 
            target: config.SUPERLEND_PROTOCOL_DATA_PROVIDER,
            params: [config.STXTZ, config.SUPERLOOP_VAULT],
        }), 
        api.call({
            abi: "function balanceOf(address user) external view returns (uint256)",
            target: config.WXTZ,
            params : [config.SUPERLOOP_VAULT]
        })
    ]);


    sdk.util.sumSingleBalance(balances, config.STXTZ, userReserveDataLend?.currentATokenBalance ?? '0', api.chain);
    sdk.util.sumSingleBalance(balances, config.WXTZ, cashReserve, api.chain);

    return balances;
}

async function borrowed(api) {
    const balances = {}

    const userReserveDataBorrow = await api.call({
            abi: userReserveDataAbi,
            target: config.SUPERLEND_PROTOCOL_DATA_PROVIDER,
            params: [config.WXTZ, config.SUPERLOOP_VAULT],
        });

    sdk.util.sumSingleBalance(balances, config.WXTZ, userReserveDataBorrow?.currentVariableDebt, api.chain);

    return balances;
}

module.exports = {
    etlk: { tvl, borrowed }
}
