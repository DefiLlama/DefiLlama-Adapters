const { sumTokens2 } = require('../helper/unwrapLPs')

// StackFi - Leveraged Lending Protocol (Gearbox fork) on Base and Avalanche
// Migrated to avax from base Jan 2026:
// https://discord.com/channels/1367273519154598058/1367273519154598061/1463539543264198761

const config = {
    base: {
        contractsRegister: '0x322b32091FC768C282C53CCd34d68Bd9639e282a',
        dataCompressor: '0xb4AD8FF39EEeF673abb43380333913E8F3f42f48',
        farm: '0x78cbFA7Ad195f6bB46Df3547C4E95797a5D834eB',
        multiRewardStaking: '0x763f57ACBa131b3E4a9Da41B50c6D3b9D804c158',
        stackToken: '0xd22b87f500f3f263014E6C5149727A6da5ffca95',
    },
    avax: {
        contractsRegister: '0xBaBeB29dA07B8953c47b770A99cbE0F82120BE14',
        dataCompressor: '0xB025C844F8F7c2E28a54d62CB38688DA3c9DEc47',
    },
}

// Data Compressor V3 ABI
const getCreditManagersV3ListAbi = "function getCreditManagersV3List() view returns (tuple(address addr, string name, uint256 cfVersion, address creditFacade, address creditConfigurator, address underlying, address pool, uint256 totalDebt, uint256 totalDebtLimit, uint256 baseBorrowRate, uint256 minDebt, uint256 maxDebt, uint256 availableToBorrow, address[] collateralTokens, tuple(address targetContract, address adapter)[] adapters, uint256[] liquidationThresholds, uint256 forbiddenTokenMask, uint8 maxEnabledTokensLength, uint16 feeInterest, uint16 feeLiquidation, uint16 liquidationDiscount, tuple(address token, uint16 rate, uint16 quotaIncreaseFee, uint96 totalQuoted, uint96 limit, bool isActive)[] quotas, tuple(address interestModel, uint256 version, uint16 U_1, uint16 U_2, uint16 R_base, uint16 R_slope1, uint16 R_slope2, uint16 R_slope3, bool isBorrowingMoreU2Forbidden) lirm, bool isPaused)[])";
async function getCreditManagers(api) {
    return await api.call({
        abi: getCreditManagersV3ListAbi,
        target: config[api.chain].dataCompressor,
    });
}

// TVL = total available to borrow from credit managers
async function tvl(api) {
    const creditManagers = await getCreditManagers(api);
    creditManagers.forEach((cm) => {
        if (cm.availableToBorrow && cm.availableToBorrow !== "0") {
            api.add(cm.underlying, cm.availableToBorrow);
        }
    });
}

// Staking = STACK tokens staked in farms
async function staking(api) {
    const cfg = config[api.chain]

    //  Farm staking
    if (cfg.farm && cfg.stackToken) {
        await sumTokens2({ api, tokensAndOwners: [[cfg.stackToken, cfg.farm]] })
    }

    // MultiRewardStaking
    if (cfg.multiRewardStaking) {
        const totalSupply = await api.call({
            abi: 'uint256:totalSupply',
            target: cfg.multiRewardStaking,
        })
        if (totalSupply && cfg.stackToken) {
            api.add(cfg.stackToken, totalSupply)
        }
    }
}

// Borrowed = total debt from credit managers
async function borrowed(api) {
    const creditManagers = await getCreditManagers(api);

    creditManagers.forEach((cm) => {
        if (cm.totalDebt && cm.totalDebt !== "0") {
            api.add(cm.underlying, cm.totalDebt);
        }
    });
}

module.exports = {
    methodology: 'TVL includes deposits in lending pools and tokens staked in farms. Borrowed shows total debt issued through credit managers.',
    base: {
        tvl,
        borrowed,
        staking,
    },
    avax: {
        tvl,
        borrowed,
    },
}