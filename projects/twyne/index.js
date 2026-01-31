const { getLogs } = require('../helper/cache/getLogs');

// Factory addresses on Ethereum mainnet
const TWYNE_FACTORY = '0xB5Eb1d005e389Bef38161691E2083b4d86FF647a';
const COLLATERAL_FACTORY = '0xa1517cCe0bE75700A8838EA1cEE0dc383cd3A332';
const START_BLOCK = 23088584; // Twyne deployment block

/**
 * Discover Twyne EVaults (credit/intermediate vaults) from TwyneGenericFactory
 * These are the Twyne-specific intermediate vaults that hold deposited assets
 */
async function getTwyneEVaults(api) {
  // Query ProxyCreated events from TwyneGenericFactory
  // Event signature: ProxyCreated(address indexed proxy, bool upgradeable, address implementation, bytes trailingData)
  const logs = await getLogs({
    api,
    target: TWYNE_FACTORY,
    eventAbi: 'event ProxyCreated(address indexed proxy, bool upgradeable, address implementation, bytes trailingData)',
    onlyArgs: true,
    fromBlock: START_BLOCK,
  });

  // Extract vault addresses from logs
  return logs.map(log => log.proxy);
}

/**
 * Discover Collateral Vaults from CollateralVaultFactory
 * These are user-specific vaults holding collateral (both Euler and Aave-based)
 */
async function getCollateralVaults(api) {
  // Query T_CollateralVaultCreated events from CollateralVaultFactory
  // Event signature: T_CollateralVaultCreated(address indexed vault)
  const logs = await getLogs({
    api,
    target: COLLATERAL_FACTORY,
    eventAbi: 'event T_CollateralVaultCreated(address indexed vault)',
    onlyArgs: true,
    fromBlock: START_BLOCK,
  });

  // Extract vault addresses from logs
  return logs.map(log => log.vault);
}

/**
 * Calculate TVL from Twyne EVaults (credit/intermediate vaults)
 *
 * Intermediate vaults hold receipt tokens from issuer vaults.
 * We need to convert receipt tokens to underlying asset amounts:
 * 1. Get totalAssets() = receipt token amount in intermediate vault
 * 2. Get asset() = address of the vault that issued the receipt tokens
 * 3. Get asset() from issuer vault = underlying asset address
 * 4. Convert receipt tokens to underlying via convertToAssets() on issuer vault
 */
async function getTwyneEVaultsTVL(api, twyneVaults) {
  if (twyneVaults.length === 0) return;

  // Step 1: Get total receipt tokens in each intermediate vault
  const receiptTokenAmounts = await api.multiCall({
    calls: twyneVaults,
    abi: 'function totalAssets() view returns (uint256)',
    permitFailure: true,
  });

  // Step 2: Get issuer vault addresses (the vaults that issued the receipt tokens)
  const issuerVaults = await api.multiCall({
    calls: twyneVaults,
    abi: 'function asset() view returns (address)',
    permitFailure: true,
  });

  // Step 3: Get underlying asset addresses from issuer vaults
  const underlyingAssets = await api.multiCall({
    calls: issuerVaults.map(issuer => issuer),
    abi: 'function asset() view returns (address)',
    permitFailure: true,
  });

  // Step 4: Convert receipt token amounts to underlying asset amounts
  const convertCalls = twyneVaults.map((vault, i) => ({
    target: issuerVaults[i],
    params: [receiptTokenAmounts[i]],
  }));

  const underlyingAmounts = await api.multiCall({
    calls: convertCalls,
    abi: 'function convertToAssets(uint256) view returns (uint256)',
    permitFailure: true,
  });

  // Add each vault's TVL to the aggregation (in terms of underlying assets)
  twyneVaults.forEach((vault, i) => {
    if (underlyingAssets[i] && underlyingAmounts[i]) {
      api.add(underlyingAssets[i], underlyingAmounts[i]);
    }
  });
}

/**
 * Calculate TVL from Collateral Vaults
 *
 * Collateral vaults hold receipt tokens from issuer vaults.
 * We need to convert receipt tokens to underlying asset amounts:
 * 1. Calculate userOwnedCollateral = totalAssetsDepositedOrReserved() - maxRelease()
 * 2. Get asset() = address of the vault that issued the receipt tokens
 * 3. Get asset() from issuer vault = underlying asset address
 * 4. Convert receipt tokens to underlying via convertToAssets() on issuer vault
 */
async function getCollateralVaultsTVL(api, collateralVaults) {
  if (collateralVaults.length === 0) return;

  // Step 1a: Get total collateral (receipt tokens) in each vault
  const totalCollaterals = await api.multiCall({
    calls: collateralVaults,
    abi: 'function totalAssetsDepositedOrReserved() view returns (uint256)',
    permitFailure: true,
  });

  // Step 1b: Get credit reserved (locked as collateral for borrowing)
  const creditReserveds = await api.multiCall({
    calls: collateralVaults,
    abi: 'function maxRelease() view returns (uint256)',
    permitFailure: true,
  });

  // Step 2: Get issuer vault addresses (the vaults that issued the receipt tokens)
  const issuerVaults = await api.multiCall({
    calls: collateralVaults,
    abi: 'function asset() view returns (address)',
    permitFailure: true,
  });

  // Step 3: Get underlying asset addresses from issuer vaults
  const underlyingAssets = await api.multiCall({
    calls: issuerVaults.map(issuer => issuer),
    abi: 'function asset() view returns (address)',
    permitFailure: true,
  });

  // Step 4: Calculate user-owned collateral and convert to underlying amounts
  const convertCalls = [];
  const vaultIndices = []; // Track which vaults have valid data for conversion

  collateralVaults.forEach((vault, i) => {
    if (totalCollaterals[i] && creditReserveds[i] && issuerVaults[i]) {
      // Calculate user-owned collateral (receipt tokens)
      const userOwnedCollateral = BigInt(totalCollaterals[i]) - BigInt(creditReserveds[i]);

      // Only convert positive values
      if (userOwnedCollateral > 0n) {
        convertCalls.push({
          target: issuerVaults[i],
          params: [userOwnedCollateral.toString()],
        });
        vaultIndices.push(i);
      }
    }
  });

  // Convert receipt token amounts to underlying asset amounts
  const underlyingAmounts = await api.multiCall({
    calls: convertCalls,
    abi: 'function convertToAssets(uint256) view returns (uint256)',
    permitFailure: true,
  });

  // Add each vault's TVL to the aggregation (in terms of underlying assets)
  underlyingAmounts.forEach((amount, idx) => {
    const vaultIndex = vaultIndices[idx];
    if (amount && underlyingAssets[vaultIndex]) {
      api.add(underlyingAssets[vaultIndex], amount);
    }
  });
}

/**
 * Main TVL function
 * Calculates total protocol TVL from:
 * 1. Twyne EVaults (credit/intermediate vaults)
 * 2. Collateral Vaults (user-specific collateral)
 */
async function tvl(api) {
  // Discover all vaults from both factories
  const [twyneVaults, collateralVaults] = await Promise.all([
    getTwyneEVaults(api),
    getCollateralVaults(api),
  ]);

  // Calculate TVL from both vault types
  await Promise.all([
    getTwyneEVaultsTVL(api, twyneVaults),
    getCollateralVaultsTVL(api, collateralVaults),
  ]);
}

module.exports = {
  ethereum: {
    tvl,
  },
};
