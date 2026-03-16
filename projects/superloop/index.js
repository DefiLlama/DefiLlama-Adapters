const sdk = require("@defillama/sdk");
const CONFIGS = require("./config");

const userReserveDataAbi = "function getUserReserveData(address asset, address user) external view override returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)";

async function tvl(api) {
    const balances = {};
    const config = CONFIGS[api.chain];

    for(let i = 0; i < config.VAULTS.length; i++) {
        const vault = config.VAULTS[i];
        const v1Vault = config.V1_VAULTS[i];
        const migrationBlock = config.MIGRATION_BLOCKS[i];

        if(!api.block || api.block > migrationBlock) {
            await processVault(api, vault, balances, config);
        } else {
            await processVault(api, v1Vault, balances, config);
        }
    }
    
    return balances;
}


async function processVault(api, vault, balances, config) {
    const { lend } = config.VAULT_TOKENS[vault];
    const underlyingTokens = config.UNDERLYING_TOKENS;

    const lendRequests = [];
    const cashReserveRequests = [];
    for(let i = 0; i < lend.length; i++) {
        lendRequests.push(api.call({
            abi: userReserveDataAbi, 
            target: config.SUPERLEND_PROTOCOL_DATA_PROVIDER,
            params: [lend[i], vault],
        }));
    }

    for(let i = 0; i < underlyingTokens.length; i++) {
        cashReserveRequests.push(api.call({
            abi: "function balanceOf(address user) external view returns (uint256)",
            target: underlyingTokens[i],
            params : [vault]
        }));
    }

    const userReserveDataLends = await Promise.all(lendRequests);
    const cashReserves = await Promise.all(cashReserveRequests);

    for(let i = 0; i < lend.length; i++) {
        sdk.util.sumSingleBalance(balances, lend[i], userReserveDataLends[i]?.currentATokenBalance ?? '0', api.chain);
    }
    for(let i = 0; i < cashReserves.length; i++) {
        sdk.util.sumSingleBalance(balances, underlyingTokens[i], cashReserves[i] ?? '0', api.chain);
    }
}

async function borrowed(api) {
    const config = CONFIGS[api.chain];
    const balances = {}

    for(let i = 0; i < config.VAULTS.length; i++) {
        const vault = config.VAULTS[i];
        const v1Vault = config.V1_VAULTS[i];
        const migrationBlock = config.MIGRATION_BLOCKS[i];

        if(!api.block || api.block > migrationBlock) {
            await processVaultBorrow(api, vault, balances, config);
        } else {
            await processVaultBorrow(api, v1Vault, balances, config);
        }
    }

    return balances;
    
}

async function processVaultBorrow(api, vault, balances, config) {
    const { borrow } = config.VAULT_TOKENS[vault];

    const borrowRequests = [];
    for(let i = 0; i < borrow.length; i++) {
        borrowRequests.push(api.call({
            abi: userReserveDataAbi,
            target: config.SUPERLEND_PROTOCOL_DATA_PROVIDER,
            params: [borrow[i], vault],
        }));
    }

    const userReserveDataBorrow = await Promise.all(borrowRequests);
    
    for(let i = 0; i < borrow.length; i++) {
        sdk.util.sumSingleBalance(balances, borrow[i], userReserveDataBorrow[i]?.currentVariableDebt ?? '0', api.chain);
    }
}

module.exports = {
    etlk: { tvl, borrowed },
    ethereum: { tvl, borrowed }
}
