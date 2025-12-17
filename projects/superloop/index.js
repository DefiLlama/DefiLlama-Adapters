const sdk = require("@defillama/sdk");
const config = require("./config");

const userReserveDataAbi = "function getUserReserveData(address asset, address user) external view override returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)";

async function tvl(api) {
    const balances = {};
        
    for(let i = 0; i < config.VAULTS.length; i++) {
        const vault = config.VAULTS[i];
        const v1Vault = config.V1_VAULTS[i];
        const migrationBlock = config.MIGRATION_BLOCKS[i];

        if(!api.block || api.block > migrationBlock) {
            await processVault(api, vault, balances);
        } else {
            await processVault(api, v1Vault, balances);
        }
    }
    
    return balances;
}

async function processVault(api, vault, balances) {
    const { lend, borrow } = config.VAULT_TOKENS[vault];

    const [userReserveDataLend, cashReserve] = await Promise.all([
        api.call({
            abi: userReserveDataAbi, 
            target: config.SUPERLEND_PROTOCOL_DATA_PROVIDER,
            params: [lend, vault],
        }), 
        api.call({
            abi: "function balanceOf(address user) external view returns (uint256)",
            target: borrow,
            params : [vault]
        })
    ]);


    sdk.util.sumSingleBalance(balances, lend, userReserveDataLend?.currentATokenBalance ?? '0', api.chain);
    sdk.util.sumSingleBalance(balances, borrow, cashReserve, api.chain);
}

async function borrowed(api) {
    const balances = {}

    for(let i = 0; i < config.VAULTS.length; i++) {
        const vault = config.VAULTS[i];
        const v1Vault = config.V1_VAULTS[i];
        const migrationBlock = config.MIGRATION_BLOCKS[i];

        if(!api.block || api.block > migrationBlock) {
            await processVaultBorrow(api, vault, balances);
        } else {
            await processVaultBorrow(api, v1Vault, balances);
        }
    }

    return balances;
    
}

async function processVaultBorrow(api, vault, balances) {
    const { borrow } = config.VAULT_TOKENS[vault];

    const userReserveDataBorrow = await api.call({
        abi: userReserveDataAbi,
        target: config.SUPERLEND_PROTOCOL_DATA_PROVIDER,
        params: [borrow, vault],
    });
    
    sdk.util.sumSingleBalance(balances, borrow, userReserveDataBorrow?.currentVariableDebt, api.chain);
}

module.exports = {
    etlk: { tvl, borrowed }
}
