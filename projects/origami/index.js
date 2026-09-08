const { get } = require('../helper/http')
const { getConfig } = require('../helper/cache')

const API_BASE = 'https://origami-api.automation-templedao.link'
const SUPPORTED_CHAINS = ['ethereum', 'berachain', 'plasma'];

// Last known vault lists (2026-09-02), used only when the API is unreachable and the config cache is empty.
const FALLBACK_VAULTS = {
  ethereum: [
    { address: '0x07c5500359161b81eb0dfff83097d5025d3cf5a2', vault_kinds: ['ERC4626'] },
    { address: '0x0f90a6962e86b5587b4c11ba2b9697dc3ba84800', vault_kinds: ['ERC4626'] },
    { address: '0x117b36e79adadd8ea81fbc53bfc9cd33270d845d', vault_kinds: ['LEVERAGE'] },
    { address: '0x1db1591540d7a6062be0837ca3c808add28844f6', vault_kinds: ['BALANCE_SHEET'] },
    { address: '0x489dd7f6f57df08871d195e78a0f0e295cf97ea1', vault_kinds: ['BALANCE_SHEET'] },
    { address: '0x6477cef63d7ccde3f300b2b22d9a4385726be453', vault_kinds: ['BALANCE_SHEET'] },
    { address: '0xd90c7b08ef0583c74890f840510cd8a5fcbf65c0', vault_kinds: ['BALANCE_SHEET'] },
  ],
  berachain: [
    { address: '0x0a377e7e3a186f15f24314941b33e0e55ce68b30', vault_kinds: ['ERC4626'] },
    { address: '0x0f678e24977ff6b2f0992939b0e66d60557ae111', vault_kinds: ['ERC4626'] },
    { address: '0x32bc5e87297e148f70867005ffdc91a9022fc1f6', vault_kinds: ['ERC4626'] },
    { address: '0x69f1e971257419b1e9c405a553f252c64a29a30a', vault_kinds: ['ERC4626'] },
    { address: '0x7a1bb5e9b7d93229df66bffe97e2854859e03afc', vault_kinds: ['ERC4626'] },
    { address: '0x7c6e5c5568647b0b90f9f962fcdffc771d7f44c5', vault_kinds: ['ERC4626'] },
    { address: '0x905c04687f8c13b489ad742ec3767b8e8a130ddf', vault_kinds: ['ERC4626'] },
    { address: '0x90b724e3ab595d1e67ba5660afbb836c0ecec557', vault_kinds: ['ERC4626'] },
    { address: '0xa777152b42d417c27e0cc257944a5bfd5fdccc69', vault_kinds: ['ERC4626'] },
    { address: '0xaa784efe92a11efa0c14a407d5c6fe230a124387', vault_kinds: ['ERC4626'] },
    { address: '0xbd2f1169ec39c240f1a2cbdf9a86b7a5d31afb92', vault_kinds: ['ERC4626'] },
    { address: '0xbd884d23bac3157ed8d8e79ec6e469f53296d263', vault_kinds: ['ERC4626'] },
    { address: '0xcdb967979ab407427c81ec2b0263fd7856f872c8', vault_kinds: ['ERC4626'] },
    { address: '0xe305a7af0c541e040aef4f4a2501ba489eb41747', vault_kinds: ['ERC4626'] },
    { address: '0x1a0730d90a253ded0177e5a1dbcfd169c5e3f67f', vault_kinds: ['AUTO_STAKING'] },
    { address: '0x3190eefb845fb739293979b2011d02dd7f247b89', vault_kinds: ['AUTO_STAKING'] },
    { address: '0x9e5cbed606d4c4e0c13ee6c94113a9852adf2aa4', vault_kinds: ['AUTO_STAKING'] },
    { address: '0xd7f54c425f64b6cd87b6b39b0a53487bcafffb0c', vault_kinds: ['AUTO_STAKING'] },
    { address: '0xdb15910600700f776ef615dd0906216cc4a7b754', vault_kinds: ['AUTO_STAKING'] },
    { address: '0xdfd2514848c012f0f09c6db33114cedb24af9a60', vault_kinds: ['AUTO_STAKING'] },
    { address: '0xe3a2159aafad831b10c1fec9662f407b4ffe7b78', vault_kinds: ['AUTO_STAKING'] },
    { address: '0xe49bc7d8ff2a5b7157c8ea9e2bdfcd18342288fa', vault_kinds: ['AUTO_STAKING'] },
    { address: '0xfcb6c2a149da114fd3f3d0fdf3f4935840b0df8a', vault_kinds: ['AUTO_STAKING'] },
  ],
  plasma: [
    { address: '0x2ec7777838a49e2c83152d455b3ca753c6d08b79', vault_kinds: ['BALANCE_SHEET'] },
    { address: '0xf7dbfcb98178b310eb481a8628f5f3e0cbe561b9', vault_kinds: ['BALANCE_SHEET'] },
  ],
}

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

  // getConfig caches the response and serves the last good copy when the API is unreachable
  let { vault_balances } = await getConfig(`origami/${api.chain}`, undefined, {
    fetcher: () => get(url.toString(), { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', 'Accept': 'application/json' } })
  })
  if (!vault_balances) vault_balances = FALLBACK_VAULTS[api.chain] ?? []
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
