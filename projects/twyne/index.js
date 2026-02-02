const { getLogs } = require('../helper/cache/getLogs');

// Factory addresses on Ethereum mainnet
const TWYNE_FACTORY = '0xB5Eb1d005e389Bef38161691E2083b4d86FF647a';
const COLLATERAL_FACTORY = '0xa1517cCe0bE75700A8838EA1cEE0dc383cd3A332';
const START_BLOCK = 23088584; // Twyne deployment block

/** Discover Twyne EVaults (credit/intermediate vaults) from TwyneGenericFactory */
async function getTwyneEVaults(api) {
    const logs = await getLogs({
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
    const logs = await getLogs({
        api,
        target: COLLATERAL_FACTORY,
        eventAbi: 'event T_CollateralVaultCreated(address indexed vault)',
        onlyArgs: true,
        fromBlock: START_BLOCK,
    });
    return logs.map(log => log.vault);
}

// Convert receipt token amounts to underlying assets and add to balances
async function addUnderlyingBalances(api, vaults, amounts) {
    if (vaults.length === 0) return;

    // Get issuer vaults (which issued the receipt tokens)
    const issuerVaults = await api.multiCall({
        calls: vaults,
        abi: 'address:asset',
        permitFailure: true,
    });

    // Get underlying asset addresses from issuer vaults  
    const underlyingAssets = await api.multiCall({
        calls: issuerVaults,
        abi: 'address:asset',
        permitFailure: true,
    });

    // Build valid conversion calls (filter out failed lookups)
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
        permitFailure: true,
    });

    // Add to balances
    underlyingAmounts.forEach((amount, idx) => {
        const i = validIndices[idx];
        if (underlyingAssets[i] && amount) {
            api.add(underlyingAssets[i], amount);
        }
    });
}

async function tvl(api) {
    const [twyneVaults, collateralVaults] = await Promise.all([
        getTwyneEVaults(api),
        getCollateralVaults(api),
    ]);

    // Get receipt token amounts from both vault types
    const [eVaultAmounts, collateralAmounts] = await Promise.all([
        api.multiCall({ calls: twyneVaults, abi: 'uint256:totalAssets', permitFailure: true }),
        api.multiCall({ calls: collateralVaults, abi: 'function totalAssetsDepositedOrReserved() view returns (uint256)', permitFailure: true }),
    ]);

    await Promise.all([
        addUnderlyingBalances(api, twyneVaults, eVaultAmounts),
        addUnderlyingBalances(api, collateralVaults, collateralAmounts),
    ]);
}

async function borrowed(api) {
    const twyneVaults = await getTwyneEVaults(api);
    const totalBorrows = await api.multiCall({
        calls: twyneVaults,
        abi: 'uint256:totalBorrows',
        permitFailure: true,
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