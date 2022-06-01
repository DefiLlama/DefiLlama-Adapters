const sdk = require('@defillama/sdk');
const abi = require("./abi.json");
const BigNumber = require('bignumber.js')

// constants
const METASTREET_VAULT_REGISTRY = '0x07AB40311B992c8C75c4813388eDf95420e8f80A';

// ask vault registry for array of all vaults + currency token
async function getAllVaults(block) {
    const vaults = [];
    allVaults = (await sdk.api.abi.call({
        target: METASTREET_VAULT_REGISTRY,
        abi: abi.getVaultList,
        block,
        chain: 'ethereum'
    })).output;

    await (
        Promise.all(allVaults.map(async (vault) => {
            //
            for (let address of allVaults) {
                let currencyToken = await getVaultCurrency(block, vault);
                vaults.push({address, currencyToken});
            }
        }))
    );

    return vaults;
}

async function getVaultCurrency(block, vault) {
    return (await sdk.api.abi.call({
      target: vault,
      abi: abi.currencyToken,
      block,
    })).output;
}

async function getTVL(balances, block, isBorrowed) {
    let vaults = await getAllVaults(block);

    // query vault balance state
    // vault tvl = cash reserves + loan balance + admin fee - withdrawals
    // vault borrows = loan balance
    const vaultBalanceState = (await sdk.api.abi.multiCall({
        abi: abi.balanceState,
        calls: vaults.map((vault) => ({
            target: vault.address
        })),
        block
    })).output.map((response) => response.output);

    for (let i = 0; i < vaults.length; i++) {
        let vaultBalance;
        if (isBorrowed) {
            vaultBalance = BigNumber(vaultBalanceState[i].totalLoanBalance).toFixed();
        } else {
            vaultBalance = 
            BigNumber(vaultBalanceState[i].totalCashBalance).plus(
            BigNumber(vaultBalanceState[i].totalAdminFeeBalance)).minus(
            BigNumber(vaultBalanceState[i].totalWithdrawalBalance)).toFixed();
        }
        sdk.util.sumSingleBalance(balances, vaults[i].currencyToken, vaultBalance);
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
    methodology: "",
};