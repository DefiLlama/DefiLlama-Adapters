const { get } = require('../helper/http')

const API_BASE = 'https://origami-api.automation-templedao.link'
const SUPPORTED_CHAINS = ['ethereum', 'berachain', 'plasma'];

module.exports = {
  doublecounted: true,
  ...Object.fromEntries(SUPPORTED_CHAINS.map((c) => [c, {tvl, borrowed}])),
}

/**
 * Discovers Origami vaults for the active chain via the /vault-token-balances endpoint
 * @param {ChainApi} api
 * @returns {Promise<Vault[]>}
 */
async function getVaults(api) {
  const chainId = api.chainId;
  if (!chainId) return [];

  const url = new URL("/public/external/vault-token-balances", API_BASE)
  url.searchParams.append("input", JSON.stringify({ chain: chainId }))

  const { vault_balances } = await get(url)
  return vault_balances.map((v) => ({ address: v.address, vaultKinds: v.vault_kinds }));
}

/**
 * @param {Vault[]} investmentVaults
 * @param {VaultKind} vaultKind
 * @returns {string[]} addresses of vaults carrying the given kind
 */
function vaultsOfKind(investmentVaults, vaultKind) {
  return investmentVaults.filter(vault => !!vault.vaultKinds.find(v => v === vaultKind)).map(v => v.address)
}

/**
 * @param {ChainApi} api
 * @param {string[]} vaults - LEVERAGE vault addresses
 */
async function processLeveragedVaults(api, vaults) {
  const [levReserveTokens, assetsAndLiabilities] = await Promise.all([
    api.multiCall({ calls: vaults, abi: 'address:reserveToken', permitFailure: true }),
    api.multiCall({ abi: 'function assetsAndLiabilities() external view returns (uint256 assets,uint256 liabilities,uint256 ratio)', calls: vaults, permitFailure: true })
  ])

  vaults.forEach((_vault, i) => {
    const levReserveToken = levReserveTokens[i]
    const assetsAndLiability = assetsAndLiabilities[i]
    if(!levReserveToken || !assetsAndLiability) return
    const levBal = assetsAndLiability.assets - assetsAndLiability.liabilities
    api.addToken(levReserveToken, levBal)
  })
}

/**
 * @param {ChainApi} api
 * @param {string[]} vaults - REPRICING vault addresses
 */
async function processRepricingVaults(api, vaults) {
  const [decimals, supplies, reserves, rawNonLevTokens] = await Promise.all([
    api.multiCall({ abi: 'uint8:decimals', calls: vaults, permitFailure: true }),
    api.multiCall({ abi: 'uint256:totalSupply', calls: vaults, permitFailure: true }),
    api.multiCall({ abi: 'uint256:reservesPerShare', calls: vaults, permitFailure: true }),
    api.multiCall({ abi: 'address:reserveToken', calls: vaults, permitFailure: true })
  ])

  await Promise.all(vaults.map(async (_vault, i) => {
    const decimal = decimals[i]
    const supply = supplies[i]
    const reserve = reserves[i]
    const rawNonLevToken = rawNonLevTokens[i]
    if (!decimals || !supply || !reserve || !rawNonLevToken) return
    const nonLevToken = await api.call({ abi: 'address:baseToken', target: rawNonLevToken })
    const bal = reserve * supply / 10 ** decimal
    api.addToken(nonLevToken, bal)
  }))
}

/**
 * @param {ChainApi} api
 * @param {string[]} vaults - ERC4626 vault addresses
 */
async function processErc4626Vaults(api, vaults) {
  const [assets, totalAssets] = await Promise.all([
    api.multiCall({ abi: 'address:asset', calls: vaults, permitFailure: true }),
    api.multiCall({ abi: 'uint256:totalAssets', calls: vaults, permitFailure: true })
  ])

  vaults.forEach((_vault, i) => {
    if (!assets[i] || !totalAssets[i]) return
    api.addToken(assets[i], totalAssets[i])
  })
}

/**
 * @param {ChainApi} api
 * @param {string[]} vaults - BALANCE_SHEET vault addresses
 */
async function processBalanceSheetVaults(api, vaults) {
  const [tokens, balanceSheet] = await Promise.all([
    api.multiCall({ abi: 'function tokens() external view returns (address[] memory assetTokens, address[] memory liabilityTokens)', calls: vaults, permitFailure: true }),
    api.multiCall({ abi: 'function balanceSheet() external view returns (uint256[] memory totalAssets, uint256[] memory totalLiabilities)', calls: vaults, permitFailure: true })
  ])

  vaults.forEach((_vault, i) => {
    const vaultTokens = tokens[i]
    const vaultBalanceSheet = balanceSheet[i]
    if (!vaultTokens || !vaultBalanceSheet) return

    vaultTokens.assetTokens.forEach((token, j) => {
      const assetAmount = vaultBalanceSheet.totalAssets[j];
      if(!token || !assetAmount) return
      api.addToken(token, assetAmount)
    })
    vaultTokens.liabilityTokens.forEach((token, j) => {
      const liabilityAmount = vaultBalanceSheet.totalLiabilities[j];
      if(!token || !liabilityAmount) return
      api.addToken(token, -liabilityAmount)
    })
  })
}

/**
 * @param {ChainApi} api
 * @param {string[]} vaults - AUTO_STAKING vault addresses
 */
async function processAutoStakingVaults(api, vaults) {
  const [stakingToken, totalSupply] = await Promise.all([
    api.multiCall({ abi: 'function stakingToken() external view returns (address)', calls: vaults, permitFailure: true }),
    api.multiCall({ abi: 'function totalSupply() external view returns (uint256)', calls: vaults, permitFailure: true })
  ])

  vaults.forEach((_vault, i) => {
    if (!stakingToken[i] || !totalSupply[i]) return
    api.addToken(stakingToken[i], totalSupply[i])
  })
}

/** @param {ChainApi} api */
async function tvl(api) {
  const vaults = await getVaults(api);
  await processLeveragedVaults(api, vaultsOfKind(vaults, 'LEVERAGE'))
  await processRepricingVaults(api, vaultsOfKind(vaults, 'REPRICING'))
  await processErc4626Vaults(api, vaultsOfKind(vaults, 'ERC4626'))
  await processBalanceSheetVaults(api, vaultsOfKind(vaults, 'BALANCE_SHEET'))
  await processAutoStakingVaults(api, vaultsOfKind(vaults, 'AUTO_STAKING'))
}

/**
 * @param {ChainApi} api
 * @param {string[]} leveragedVaults - LEVERAGE vault addresses
 */
async function borrowedLeveragedVaults(api, leveragedVaults) {
  // Retrieve the token balance of the underlying debt token
  const managers = await api.multiCall({ calls: leveragedVaults, abi: 'address:manager', permitFailure: true })
  const borrowLends = await api.multiCall({ calls: managers, abi: 'address:borrowLend', permitFailure: true })
  const [borrowTokens, borrowAmounts] = await Promise.all([
    await api.multiCall({ calls: borrowLends, abi: 'address:borrowToken', permitFailure: true }),
    await api.multiCall({ calls: borrowLends, abi: 'address:debtBalance', permitFailure: true })
  ])

  leveragedVaults.forEach((_vault, i) => {
    const debtToken = borrowTokens[i]
    const debtAmount = borrowAmounts[i]
    if(!debtToken || !debtAmount) return
    api.addToken(debtToken, debtAmount)
  })
}

/**
 * @param {ChainApi} api
 * @param {string[]} vaults - BALANCE_SHEET vault addresses
 */
async function borrowedBalanceSheetVaults(api, vaults) {
  const [tokens, balanceSheet] = await Promise.all([
    api.multiCall({ abi: 'function tokens() external view returns (address[] memory assetTokens, address[] memory liabilityTokens)', calls: vaults, permitFailure: true }),
    api.multiCall({ abi: 'function balanceSheet() external view returns (uint256[] memory totalAssets, uint256[] memory totalLiabilities)', calls: vaults, permitFailure: true })
  ])

  vaults.forEach((_vault, i) => {
    const vaultTokens = tokens[i]
    const vaultBalanceSheet = balanceSheet[i]
    if (!vaultTokens || !vaultBalanceSheet) return

    vaultTokens.liabilityTokens.forEach((token, j) => {
      const liabilityAmount = vaultBalanceSheet.totalLiabilities[j];
      if(!token || !liabilityAmount) return
      api.addToken(token, liabilityAmount)
    })
  })
}

/** @param {ChainApi} api */
async function borrowed(api) {
  const vaults = await getVaults(api);
  await borrowedLeveragedVaults(api, vaultsOfKind(vaults, 'LEVERAGE'))
  await borrowedBalanceSheetVaults(api, vaultsOfKind(vaults, 'BALANCE_SHEET'))
}

/** @typedef {import('@defillama/sdk').ChainApi} ChainApi */

/**
 * Origami vault kind tag. A vault may carry multiple kinds, e.g. `['ERC4626', 'LEVERAGE']`.
 * @typedef {'ERC4626' | 'REPRICING' | 'LEVERAGE' | 'BALANCE_SHEET' | 'AUTO_STAKING'} VaultKind
 */

/**
 * Per-vault row returned by `GET /public/external/vault-token-balances`.
 * @typedef {Object} VaultBalances
 * @property {string} address - Vault contract address
 * @property {VaultKind[]} vault_kinds
 */

/**
 * Vault descriptor consumed by the on-chain balance functions.
 * @typedef {Object} Vault
 * @property {string} address
 * @property {VaultKind[]} vaultKinds
 */
