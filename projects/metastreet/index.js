const sdk = require('@defillama/sdk');
const abi = require("./abi.json");
const BigNumber = require('bignumber.js')

// Constants
const METASTREET_VAULT_REGISTRY = '0x07AB40311B992c8C75c4813388eDf95420e8f80A';

// Gets the array of all MetaStreet Vaults registered in VaultRegistry
// and the currency token the vault balances are denoted in
async function getAllVaults(block) {
    const vaultList = (await sdk.api.abi.call({
        target: METASTREET_VAULT_REGISTRY,
        abi: abi.getVaultList,
        block,
    })).output;

    // 
    const vaults = (await sdk.api.abi.multiCall({
        abi: abi.currencyToken,
        calls: vaultList.map((vault) => ({
            target: vault
        })),
        block
    })).output.map((response) => ({
        address: response.input.target, 
        currencyToken: response.output
    }));

    return vaults;
}

// Calculates the TVL or borrowed funds across all MetaStreet vaults
async function getTVL(balances, block, isBorrowed) {
    const vaults = await getAllVaults(block);

    // Vault TVL = cash reserves = vault balance - admin fee - pending withdrawals
    // TODO: Could rewrite using the ERC20 balance and subtracting admin fees/
    // withdrawals to slightly reduce reliance on vault's internal state keeping
    // TODO: Could incorporate NFT collateral value into TVL
    const vaultBalances = (await sdk.api.abi.multiCall({
        abi: abi.balanceState,
        calls: vaults.map((vault) => ({
            target: vault.address
        })),
        block
    })).output.map((response) => (
        // If borrows, return loan balance; otherwise, return cash balance
        isBorrowed ? response.output.totalLoanBalance : response.output.totalCashBalance
    ));
    
    for (let i = 0; i < vaults.length; i++) {
        sdk.util.sumSingleBalance(balances, vaults[i].currencyToken, vaultBalances[i]);
    };

    return balances;
}

async function borrowed(timestamp, block) {
    const balances = {};
    await getTVL(balances, block, true);
    return balances;
}

async function tvl(timestamp, block) {
    const balances = {};
    await getTVL(balances, block, false);
    return balances;
}

module.exports = {
    ethereum:{
        tvl,
        borrowed,
    },
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'TVL is calculated by getting the totalCashBalance of each vault, which counts currency tokens deposited into contracts for earning yield but not NFT collateral tokens. Borrowed tokens are also not counted towards TVL.',
    start: 14878205
};