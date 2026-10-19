const { BorshAccountsCoder } = require('@project-serum/anchor')
const { getMultipleAccounts, sumTokens2 } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')
const kaminoIdl = require('../kamino-lending/kamino-lending-idl.json')
const kvaultIdl = require('../gauntlet/kvault-idl.json')

const PROGRAM = 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD'
const VAULT_PROGRAM = 'KvauGMspG5k6rtzrqqn7WNn3oZdyKqLKwK2XWQ8FLjd'
const MARKET = 'F4uLsGZT4YnHDcemtoYDz2LBZKLmwTB1wzkwS6oqygvy'
// Live market and vault configuration: https://github.com/Nysa-Finance/nysa-frontend/blob/main/src/config.js
const RESERVES = [
  ['rpTGWR3JDjjPfXLCg5Fx1GpSdUxPt1pxW7fwXGUT6js', 'A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6'], // USDY
  ['GQr5hXuRgHAmguh6EqcpeJXrMyqCQch4P6XkSvawwNk2', ADDRESSES.solana.USDC],
]
// Kamino Earn vaults curated by Nysa
const VAULTS = [
  ['2Qxsj1hi95avkp7sANDmbVT5TwqRPGsutuvJasJK9xL7', ADDRESSES.solana.USDC], // RWA Prime
]
const EMPTY_ALLOCATION = '11111111111111111111111111111111'
const coder = new BorshAccountsCoder(kaminoIdl)
const vaultCoder = new BorshAccountsCoder(kvaultIdl)

/**
 * Load Nysa's reserves and reject missing or mismatched on-chain accounts.
 * @param {object} api DefiLlama chain API used for Solana account reads.
 * @returns {Promise<object[]>} Decoded reserves with verified program, market, and mint.
 */
async function getReserves(api) {
  const accounts = await getMultipleAccounts(RESERVES.map(([address]) => address), { api })
  return RESERVES.map(([address, mint], i) => {
    const account = accounts[i]
    if (!account) throw new Error(`Nysa: missing reserve ${address}`)
    if (account.owner.toString() !== PROGRAM) throw new Error(`Nysa: unexpected program owner for reserve ${address}`)

    const reserve = coder.decode('Reserve', account.data)
    if (reserve.lendingMarket.toString() !== MARKET) throw new Error(`Nysa: unexpected lending market for reserve ${address}`)
    if (reserve.liquidity.mintPubkey.toString() !== mint) throw new Error(`Nysa: unexpected mint for reserve ${address}`)
    return reserve
  })
}

/**
 * Load Nysa's vaults and reject missing or mismatched on-chain accounts.
 * @param {object} api DefiLlama chain API used for Solana account reads.
 * @returns {Promise<object[]>} Decoded vault states with verified program and token mint.
 */
async function getVaults(api) {
  const accounts = await getMultipleAccounts(VAULTS.map(([address]) => address), { api })
  return VAULTS.map(([address, mint], i) => {
    const account = accounts[i]
    if (!account) throw new Error(`Nysa: missing vault ${address}`)
    if (account.owner.toString() !== VAULT_PROGRAM) throw new Error(`Nysa: unexpected program owner for vault ${address}`)

    const vault = vaultCoder.decode('VaultState', account.data)
    if (vault.tokenMint.toString() !== mint) throw new Error(`Nysa: unexpected mint for vault ${address}`)
    return vault
  })
}

/**
 * Collect vault positions in reserves outside Nysa's market. Positions in Nysa's own reserves are skipped,
 * because those reserves' supply vaults and debt are already counted.
 * @param {object} api DefiLlama chain API used for Solana account reads.
 * @param {object[]} vaults Decoded vault states.
 * @returns {Promise<{ reserve: object, ctokens: bigint }[]>} External reserves with the vaults' combined cToken balance.
 */
async function getExternalAllocations(api, vaults) {
  const own = new Set(RESERVES.map(([address]) => address))
  const ctokens = {}
  for (const vault of vaults)
    for (const { reserve, ctokenAllocation } of vault.vaultAllocationStrategy) {
      const address = reserve.toString()
      if (address === EMPTY_ALLOCATION || own.has(address) || ctokenAllocation.isZero()) continue
      ctokens[address] = (ctokens[address] ?? 0n) + BigInt(ctokenAllocation.toString())
    }

  const addresses = Object.keys(ctokens)
  const accounts = await getMultipleAccounts(addresses, { api })
  return addresses.map((address, i) => {
    const account = accounts[i]
    if (!account) throw new Error(`Nysa: missing vault reserve ${address}`)
    if (account.owner.toString() !== PROGRAM) throw new Error(`Nysa: unexpected program owner for vault reserve ${address}`)
    return { reserve: coder.decode('Reserve', account.data), ctokens: ctokens[address] }
  })
}

/**
 * Pro-rata share of a reserve amount for a cToken balance.
 * @param {bigint} amount Reserve amount in raw token units.
 * @param {bigint} ctokens cToken balance.
 * @param {object} reserve Decoded reserve.
 * @returns {string} Share in raw token units, truncated.
 */
function share(amount, ctokens, reserve) {
  const supply = BigInt(reserve.collateral.mintTotalSupply.toString())
  return supply > 0n ? (amount * ctokens / supply).toString() : '0'
}

/**
 * Debt of a reserve in raw token units, truncating sub-atomic Q60 dust.
 * @param {object} reserve Decoded reserve.
 * @returns {bigint} Outstanding debt.
 */
function debtOf(reserve) {
  return BigInt(reserve.liquidity.borrowedAmountSf.toString()) / (1n << 60n)
}

/**
 * Sum underlying tokens held in the reserves' liquidity supply vaults, plus vault tokens not deployed into them.
 * @param {object} api DefiLlama chain API receiving raw token balances.
 * @returns {Promise<object>} Vault balances, excluding borrowed-out tokens.
 */
async function tvl(api) {
  const [reserves, vaults] = await Promise.all([getReserves(api), getVaults(api)])
  // Idle vault tokens by the vault's own accounting, which leaves out reward tokens not yet paid into the vault.
  vaults.forEach(vault => api.add(vault.tokenMint.toString(), vault.tokenAvailable.toString()))
  for (const { reserve, ctokens } of await getExternalAllocations(api, vaults))
    api.add(reserve.liquidity.mintPubkey.toString(), share(BigInt(reserve.liquidity.availableAmount.toString()), ctokens, reserve))
  return sumTokens2({ api, tokenAccounts: reserves.map(reserve => reserve.liquidity.supplyVault.toString()) })
}

/**
 * Add outstanding debt in raw token units, including the vaults' share of debt in external reserves.
 * @param {object} api DefiLlama chain API receiving borrowed token balances.
 * @returns {Promise<void>} Resolves after adding debt for each validated reserve.
 */
async function borrowed(api) {
  const [reserves, vaults] = await Promise.all([getReserves(api), getVaults(api)])
  for (const reserve of reserves)
    api.add(reserve.liquidity.mintPubkey.toString(), debtOf(reserve).toString())
  for (const { reserve, ctokens } of await getExternalAllocations(api, vaults))
    api.add(reserve.liquidity.mintPubkey.toString(), share(debtOf(reserve), ctokens, reserve))
}

module.exports = {
  doublecounted: true, // DefiLlama confirmed these deposits overlap Kamino Lend TVL.
  timetravel: false,
  methodology: 'Counts USDY collateral and unborrowed USDC held in the liquidity supply vaults of Nysa\'s curated Kamino market on Solana, plus USDC in Nysa\'s curated Kamino Earn vault (RWA Prime) that is not deployed into that market: idle vault USDC and the vault\'s share of unborrowed liquidity in any other Kamino reserve. Vault deposits into Nysa\'s own market are counted once, through the market. Outstanding debt, including the vault\'s share of debt in other reserves, is reported separately as borrowed. Collateral receipt tokens, vault shares, undistributed incentives, and Farm Points are not added to TVL. These deposits overlap Kamino TVL, so the adapter is marked doublecounted.',
  solana: { tvl, borrowed },
}
