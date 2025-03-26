const sdk = require('@defillama/sdk');
const abi = require("./abi.json");
const BigNumber = require('bignumber.js');
const { getTvl } = require('../helper/aave');

// Constants
const METASTREET_VAULT_REGISTRY = '0x07AB40311B992c8C75c4813388eDf95420e8f80A';

// Gets all MetaStreet Vaults registered in VaultRegistry and their
// corresponding currency token each vault's balance is denoted in
async function getAllVaultsAndTokens(block) {
    const vaults = (await sdk.api.abi.call({
        target: METASTREET_VAULT_REGISTRY,
        abi: abi.getVaultList,
        block,
    })).output;

    const tokens = (await sdk.api.abi.multiCall({
        abi: abi.currencyToken,
        calls: vaults.map((vault) => ({
            target: vault
        })),
        block
    })).output.map((response) => (
        response.output
    ));

    return [vaults, tokens];
}

// Calculates the TVL across all MetaStreet vaults
async function getTVL(balances, block, vaults, tokens) {
    // TODO: Could incorporate NFT loan collateral value into TVL?
    const vaultBalances = (await sdk.api.abi.multiCall({
        calls: vaults.map((vault, index) => ({
            target: tokens[index],
            params: vault,
        })),
        abi: 'erc20:balanceOf',
        block
    })).output.map((response) => (
        response.output
    ));
    
    // Sum up token balances
    for (let i = 0; i < vaults.length; i++) {
        sdk.util.sumSingleBalance(balances, tokens[i], vaultBalances[i]);
    }

    return balances;
}

// Calculates loan balance across all MetaStreet vaults
async function getBorrowed(balances, block, vaults, tokens) {
    const vaultBalances = (await sdk.api.abi.multiCall({
        abi: abi.balanceState,
        calls: vaults.map((vault) => ({
            target: vault
        })),
        block
    })).output.map((response) => (
        response.output.totalLoanBalance
    ));
    
    // Sum up token balances
    for (let i = 0; i < vaults.length; i++) {
        sdk.util.sumSingleBalance(balances, tokens[i], vaultBalances[i]);
    }

    return balances;
}

function getMetaStreetTVL(isBorrowed) {
    return async (_, block) => {
        const balances = {}    
        // Get all vaults and tokens
        const [vaults, tokens] = await getAllVaultsAndTokens(block);
        if (isBorrowed) {
            await getBorrowed(balances, block, vaults, tokens);
        } else {
            await getTVL(balances, block, vaults, tokens);
        }
        return balances;
    }
}

module.exports = {
    ethereum:{
        tvl: getMetaStreetTVL(false),
        borrowed: getMetaStreetTVL(true),
    },
            methodology: 'TVL is calculated by getting the ERC20 balance of each vault, which counts tokens deposited into contracts for earning yield but not the value of any NFT loan note collateral the vault has purchased. Borrowed tokens are also not counted towards TVL.',
};