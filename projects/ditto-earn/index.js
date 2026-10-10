const ADDRESSES = require('../helper/coreAssets.json');

// Maintained deployment inventory: https://docs.dittonetwork.io/ditto-earn
// Roots only: custody links and registered Ethereum strategies are read at api.block.
const YIELD_SPLIT = '0x62507A876309639096D08E7F77AC9CfB67Df8011';
const MUSD_VAULTS = [
  '0x762a17f2B3164ea5010C1C88085AeAC8872957D0', // August 11 pilot; still funded
  '0x9171Cb787C3fEEbBC808D07CaB62B1d789CE14F8', // September 23 V2
];
const RECEIVERS = [
  '0x7817548BE174C22DecDe831Ea9d514927fD0D286', // pilot, Ethereum
  '0x73e97D42f341713e2ED10E55964C066d924a8106', // V2, Ethereum
];
const ZERO = '0x0000000000000000000000000000000000000000';
/** Deduplicate custody addresses case-insensitively and exclude the zero address. */
const unique = addresses => [...new Set(addresses.map(address => address.toLowerCase()))].filter(address => address !== ZERO);

/**
 * Select contracts deployed at the requested historical block.
 * A genuine pre-deployment zero is allowed; provider failures propagate.
 * @param {object} api DeFiLlama chain API pinned to the requested block.
 * @param {string[]} addresses Public deployment roots to check.
 * @returns {Promise<string[]>} Roots with deployed bytecode at that block.
 */
async function deployed(api, addresses) {
  const block = await api.getBlock();
  const code = await Promise.all(addresses.map(address => api.provider.getCode(address, block)));
  return addresses.filter((_, index) => code[index] !== '0x');
}

/**
 * Count settled MUSD/mUSDC cash across vaults and their on-chain custody links.
 * Excludes posted NAV, queue liabilities and transfers in flight.
 * @param {object} api DeFiLlama Mezo API pinned to the requested block.
 * @returns {Promise<object>} Underlying asset balances without duplicate owners.
 */
async function mezoTvl(api) {
  const vaults = await deployed(api, MUSD_VAULTS);
  if (!vaults.length) return api.getBalances();
  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults });
  if (assets.some(asset => asset.toLowerCase() !== ADDRESSES.mezo.MUSD.toLowerCase()))
    throw new Error('Ditto MUSD vault asset changed');
  const queues = await api.multiCall({ abi: 'address:queue', calls: vaults });
  const executors = unique(await api.multiCall({ abi: 'address:executor', calls: vaults }));
  const swaps = await api.multiCall({ abi: 'address:swapAdapter', calls: executors });
  const bridges = await api.multiCall({ abi: 'address:bridgeAdapter', calls: executors });
  const owners = unique([...vaults, ...queues, ...executors, ...swaps, ...bridges]);
  // Actual cash, not queue liabilities or the vault's operator-posted totalAssets/NAV.
  return api.sumTokens({ tokens: [ADDRESSES.mezo.MUSD, ADDRESSES.mezo.mUSDC], owners, skipDuplicates: true });
}

/**
 * Count Yield Split underlying, registered external strategy exposure and cash.
 * Excludes intra-Ditto receipts and avoids counting pending claims twice.
 * @param {object} api DeFiLlama Ethereum API pinned to the requested block.
 * @returns {Promise<object>} Settled underlying asset balances.
 */
async function ethereumTvl(api) {
  const yieldSplit = await deployed(api, [YIELD_SPLIT]);
  if (yieldSplit.length) await api.erc4626Sum({ calls: yieldSplit, isOG4626: true });
  const receivers = await deployed(api, RECEIVERS);
  if (!receivers.length) return api.getBalances();
  const tokens = await api.multiCall({ abi: 'address:usdc', calls: receivers });
  if (tokens.some(token => token.toLowerCase() !== ADDRESSES.ethereum.USDC.toLowerCase()))
    throw new Error('Ditto receiver asset changed');
  const bridges = await api.multiCall({ abi: 'address:bridgeAdapter', calls: receivers });
  const counts = await api.multiCall({ abi: 'uint256:adapterCount', calls: receivers });
  const calls = receivers.flatMap((target, index) => {
    const count = Number(counts[index]);
    if (!Number.isSafeInteger(count) || count < 0 || count > 100)
      throw new Error('Invalid Ditto strategy registry length');
    return Array.from({ length: count }, (_, params) => ({ target, params }));
  });
  const strategies = unique(await api.multiCall({ abi: 'function adapterAt(uint256) view returns (address)', calls }));
  if (strategies.length) {
    const assets = await api.multiCall({ abi: 'address:asset', calls: strategies });
    if (assets.some(asset => asset.toLowerCase() !== ADDRESSES.ethereum.USDC.toLowerCase()))
      throw new Error('Ditto strategy asset changed');
    const shells = await api.multiCall({ abi: 'address:shell', calls: strategies });
    // If a receiver allocates into our own Yield Split, its whole vault is already
    // counted above. Do not count that intra-Ditto receipt exposure a second time.
    const external = strategies.filter((_, index) => shells[index].toLowerCase() !== YIELD_SPLIT.toLowerCase());
    const managed = await api.multiCall({ abi: 'uint256:totalManaged', calls: external });
    managed.forEach(amount => api.add(ADDRESSES.ethereum.USDC, amount));
  }
  // totalManaged = shell.convertToAssets(shell.balanceOf(adapter)). Unbonded
  // USDC sits outside that share balance: add its cash once, not pendingClaimable too.
  const owners = unique([...receivers, ...bridges, ...strategies]);
  return api.sumTokens({ token: ADDRESSES.ethereum.USDC, owners, skipDuplicates: true });
}

module.exports = {
  start: '2026-01-26', // Yield Split creation: Ethereum block 24322294
  doublecounted: true, // Spark Savings; Yield Split also deposits into Aave, Morpho and Fluid.
  methodology: 'Counts settled underlying assets in Ditto Earn vaults, custody contracts and registered strategies on each chain. Yield Split uses ERC-4626 totalAssets net of accrued performance fees; MUSD uses actual MUSD/mUSDC cash and Ethereum USDC backing, not posted NAV. Funded withdrawal cash remains counted until claim. Excludes bridge transfers in flight, receipt tokens, native gas and treasury holdings. External lending/savings exposure overlaps Spark Savings, Aave, Morpho and Fluid.',
  ethereum: { tvl: ethereumTvl },
  mezo: { tvl: mezoTvl },
};
