const { getLogs2 } = require('../helper/cache/getLogs');

// Factory addresses on Ethereum mainnet
const TWYNE_FACTORY = '0xB5Eb1d005e389Bef38161691E2083b4d86FF647a';
const COLLATERAL_FACTORY = '0xa1517cCe0bE75700A8838EA1cEE0dc383cd3A332';
const START_BLOCK = 23088584; // Twyne deployment block

/** Discover Twyne EVaults (credit/intermediate vaults) from TwyneGenericFactory */
async function getTwyneEVaults(api) {
    const logs = await getLogs2({
        api,
        target: TWYNE_FACTORY,
        eventAbi: 'event ProxyCreated(address indexed proxy, bool upgradeable, address implementation, bytes trailingData)',
        onlyArgs: true,
        fromBlock: START_BLOCK,
    });
    return logs.map(log => log.proxy);
}

/** Discover Collateral Vaults from CollateralVaultFactory */
async function getCollateralVaults(api) {
    const logs = await getLogs2({
        api,
        target: COLLATERAL_FACTORY,
        eventAbi: 'event T_CollateralVaultCreated(address indexed vault)',
        onlyArgs: true,
        fromBlock: START_BLOCK,
    });
    return logs.map(log => log.vault);
}

// Convert receipt token amounts to underlying assets and add to balances
async function addUnderlyingBalances(api, vaults, amounts, { subtract = false } = {}) {
    if (vaults.length === 0) return;

    // Get issuer vaults (which issued the receipt tokens)
    const issuerVaults = await api.multiCall({
        calls: vaults,
        abi: 'address:asset',
    });

    // Get underlying asset addresses from issuer vaults  
    const underlyingAssets = await api.multiCall({
        calls: issuerVaults,
        abi: 'address:asset',
    });

    const validIndices = [];
    const convertCalls = [];
    vaults.forEach((_, i) => {
        if (issuerVaults[i] && amounts[i]) {
            validIndices.push(i);
            convertCalls.push({ target: issuerVaults[i], params: [amounts[i]] });
        }
    });

    // Convert receipt token amounts to underlying amounts
    const underlyingAmounts = await api.multiCall({
        calls: convertCalls,
        abi: 'function convertToAssets(uint256) view returns (uint256)',
    });

    // Add or subtract from balances
    underlyingAmounts.forEach((amount, idx) => {
        const i = validIndices[idx];
        if (underlyingAssets[i] && amount) {
            api.add(underlyingAssets[i], subtract ? -amount : amount);
        }
    });
}

async function tvl(api) {
    const twyneVaults = await getTwyneEVaults(api);
    const collateralVaults = await getCollateralVaults(api);

    const eVaultAmounts = await api.multiCall({
        calls: twyneVaults,
        abi: 'uint256:totalAssets',
    });
    await addUnderlyingBalances(api, twyneVaults, eVaultAmounts);

    const collateralAmounts = await api.multiCall({
        calls: collateralVaults,
        abi: 'function totalAssetsDepositedOrReserved() view returns (uint256)',
    });
    await addUnderlyingBalances(api, collateralVaults, collateralAmounts);

    const totalBorrows = await api.multiCall({
        calls: twyneVaults,
        abi: 'uint256:totalBorrows',
    });
    await addUnderlyingBalances(api, twyneVaults, totalBorrows, { subtract: true });
}

async function borrowed(api) {
    const twyneVaults = await getTwyneEVaults(api);

    const totalBorrows = await api.multiCall({
        calls: twyneVaults,
        abi: 'uint256:totalBorrows',
    });
    await addUnderlyingBalances(api, twyneVaults, totalBorrows);
}

module.exports = {
    methodology: 'TVL is total credit delegated to intermediate vaults and collateral deposited to Twyne collateral vaults. Borrowed represents outstanding borrows from EVaults.',
    ethereum: {
        tvl,
        borrowed,
    },
};