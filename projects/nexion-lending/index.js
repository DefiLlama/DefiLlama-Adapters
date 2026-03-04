// Gearbox-style lending protocol addresses
const dataCompressor = '0x88fCeFdb06341282FcdFd0AB6A7f811f7B0010b7';

// Data Compressor V3 ABI
const getCreditManagersV3ListAbi = "function getCreditManagersV3List() view returns (tuple(address addr, string name, uint256 cfVersion, address creditFacade, address creditConfigurator, address underlying, address pool, uint256 totalDebt, uint256 totalDebtLimit, uint256 baseBorrowRate, uint256 minDebt, uint256 maxDebt, uint256 availableToBorrow, address[] collateralTokens, tuple(address targetContract, address adapter)[] adapters, uint256[] liquidationThresholds, uint256 forbiddenTokenMask, uint8 maxEnabledTokensLength, uint16 feeInterest, uint16 feeLiquidation, uint16 liquidationDiscount, tuple(address token, uint16 rate, uint16 quotaIncreaseFee, uint96 totalQuoted, uint96 limit, bool isActive)[] quotas, tuple(address interestModel, uint256 version, uint16 U_1, uint16 U_2, uint16 R_base, uint16 R_slope1, uint16 R_slope2, uint16 R_slope3, bool isBorrowingMoreU2Forbidden) lirm, bool isPaused)[])";

async function getCreditManagers(api) {
    return await api.call({
        abi: getCreditManagersV3ListAbi,
        target: dataCompressor,
    });
}

async function tvl(api) {
    const creditManagers = await getCreditManagers(api);
    creditManagers.forEach((cm) => {
        if (cm.availableToBorrow && cm.availableToBorrow !== "0") {
            api.add(cm.underlying, cm.availableToBorrow);
        }
    });
}

async function borrowed(api) {
    const creditManagers = await getCreditManagers(api);
    creditManagers.forEach((cm) => {
        if (cm.totalDebt && cm.totalDebt !== "0") {
            // Add the debt in the underlying token - DeFiLlama will handle USD conversion
            api.add(cm.underlying, cm.totalDebt);
        }
    });
}

module.exports = {
    methodology: "TVL is the amount available to be borrowed from all credit managers.",
    pulse: {
        tvl,
        borrowed
    },
};