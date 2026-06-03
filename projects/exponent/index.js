const { getConnection, getProvider } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const { decodeAccount } = require('../helper/utils/solana/layout')
const { Program } = require('@coral-xyz/anchor')

const { getConfig } = require('../helper/cache')
const idl = require('./idl.json')

const EXPONENT_CORE_PROGRAM_ID = 'ExponentnaRg3CQbW6dqQNZKXp7gtZ9DGMp1cwC4HAS7'
const EXPONENT_CLMM_PROGRAM_ID = 'XPC1MM4dYACDfykNuXYZ5una2DsMDWL24CrYubCvarC'
const EXPONENT_ORDERBOOK_PROGRAM_ID = 'XPBookgQTN2p8Yw1C2La35XkPMmZTCEYH77AdReVvK1'
const EXPONENT_API_V2_BASE = 'https://api.exponent.finance'
const DEFILLAMA_SY_PAYLOAD_URL = `${EXPONENT_API_V2_BASE}/defillama/sy-payload`
const MANAGED_TOTAL_AUM_URL = `${EXPONENT_API_V2_BASE}/strategies/managed/total-aum`

// Exponent stores the SY exchange rate with 1e12 fixed-point precision.
const SY_EXCHANGE_RATE_SCALE = 12n

// These protocol buckets are already represented by core vault accounting, so
// adding managed-strategy exposure back into them would double count TVL.
const EXPONENT_INTERNAL_PROTOCOL_KEYS = new Set([
  EXPONENT_CORE_PROGRAM_ID,
  EXPONENT_CLMM_PROGRAM_ID,
  EXPONENT_ORDERBOOK_PROGRAM_ID,
])

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0
}

function parsePositiveBigIntString(value) {
  if (!isNonEmptyString(value) || !/^\d+$/.test(value)) return null

  const amount = BigInt(value)
  return amount > 0n ? amount : null
}

function getLastSeenSyExchangeRateRaw(vaultAccount) {
  const rawRate = vaultAccount?.lastSeenSyExchangeRate?.[0]?.[0]
  if (rawRate == null) return null

  const rate = parsePositiveBigIntString(rawRate.toString())
  return rate ?? null
}

/**
 * Converts SY mint supply into quote raw units using the onchain exchange rate.
 */
function computeQuoteRawFromSySupply({ supply, syExchangeRateRaw }) {
  const quoteRaw = (supply * syExchangeRateRaw) / (10n ** SY_EXCHANGE_RATE_SCALE)
  return quoteRaw > 0n ? quoteRaw : null
}

/**
 * Converts quote raw units into DefiLlama base raw units using the precomputed
 * quote-to-base rate supplied by the API payload.
 */
function convertQuoteRawToBaseRaw({ quoteRaw, quoteToBaseRate, quoteToBaseRateScale }) {
  const rateRaw = parsePositiveBigIntString(quoteToBaseRate)
  if (!rateRaw || !isNonNegativeInteger(quoteToBaseRateScale)) return null

  const scaleDenominator = 10n ** BigInt(quoteToBaseRateScale)
  const amount = (quoteRaw * rateRaw) / scaleDenominator
  return amount > 0n ? amount : null
}

/**
 * Validates a DefiLlama SY payload row and returns the fields needed by the
 * adapter's TVL calculation.
 */
function parseSyPayloadEntry(entry) {
  if (!entry || typeof entry !== 'object') return null

  const { mintSy, baseMint, quoteToBaseRate, quoteToBaseRateScale } = entry
  if (!isNonEmptyString(mintSy)) return null
  if (!isNonEmptyString(baseMint)) return null
  if (!isNonEmptyString(quoteToBaseRate)) return null
  if (!isNonNegativeInteger(quoteToBaseRateScale)) return null

  return {
    mintSy,
    baseMint,
    quoteToBaseRate,
    quoteToBaseRateScale,
  }
}

function parseManagedAumAmountRaw(value) {
  if (!value || typeof value !== 'object') return null
  return parsePositiveBigIntString(value.aumUnderlyingRaw ?? value.amountRaw)
}

async function fetchVaultAccounts(program) {
  return program.account.vault.all()
}

function buildSyExchangeRateByMint(vaultAccounts) {
  const syExchangeRateByMint = new Map()

  vaultAccounts.forEach((vault) => {
    const mintSy = vault.account.mintSy.toString()
    const syExchangeRateRaw = getLastSeenSyExchangeRateRaw(vault.account)
    if (!syExchangeRateRaw) return

    syExchangeRateByMint.set(mintSy, syExchangeRateRaw)
  })

  return syExchangeRateByMint
}

async function fetchSyMintAccountMap(connection, syExchangeRateByMint) {
  const syMintPubkeys = [...syExchangeRateByMint.keys()].map((mint) => new PublicKey(mint))
  if (syMintPubkeys.length === 0) return new Map()

  const syMintAccounts = await connection.getMultipleAccountsInfo(syMintPubkeys)
  const syMintAccountMap = new Map()

  syMintAccounts.forEach((account, index) => {
    if (!account) return
    syMintAccountMap.set(syMintPubkeys[index].toString(), account)
  })

  return syMintAccountMap
}

async function fetchSyPayloadByMint() {
  const syPayload = await getConfig(
    'exponent-defillama-sy-payload',
    DEFILLAMA_SY_PAYLOAD_URL
  )

  const syPayloadByMint = new Map()
  if (!Array.isArray(syPayload)) return syPayloadByMint

  syPayload.forEach((entry) => {
    const parsedEntry = parseSyPayloadEntry(entry)
    if (!parsedEntry) return

    syPayloadByMint.set(parsedEntry.mintSy, parsedEntry)
  })

  return syPayloadByMint
}

async function addCoreTvl(api, program, connection) {
  const vaultAccounts = await fetchVaultAccounts(program)
  const syExchangeRateByMint = buildSyExchangeRateByMint(vaultAccounts)
  const syMintAccountMap = await fetchSyMintAccountMap(connection, syExchangeRateByMint)
  const syPayloadByMint = await fetchSyPayloadByMint()

  syPayloadByMint.forEach((payload, mintSy) => {
    const mintAccount = syMintAccountMap.get(mintSy)
    if (!mintAccount) return

    const syExchangeRateRaw = syExchangeRateByMint.get(mintSy)
    if (!syExchangeRateRaw) return

    const decodedMint = decodeAccount('mint', mintAccount)
    const supply = parsePositiveBigIntString(decodedMint.supply.toString())
    if (!supply) return

    const quoteRaw = computeQuoteRawFromSySupply({ supply, syExchangeRateRaw })
    if (!quoteRaw) return

    const amount = convertQuoteRawToBaseRaw({
      quoteRaw,
      quoteToBaseRate: payload.quoteToBaseRate,
      quoteToBaseRateScale: payload.quoteToBaseRateScale,
    })
    if (!amount) return

    api.add(payload.baseMint, amount)
  })
}

async function addManagedVaultAum(api) {
  // Managed strategies can deploy capital into external protocols that are not
  // visible from core SY/PT/YT supply alone, so fetch that exposure separately.
  const managedAum = await getConfig(
    'exponent-managed-total-aum',
    MANAGED_TOTAL_AUM_URL
  )

  Object.entries(managedAum || {}).forEach(([protocolKey, mintEntries]) => {
    // Skip Exponent-internal venues: that capital is already counted in core TVL.
    if (EXPONENT_INTERNAL_PROTOCOL_KEYS.has(protocolKey)) return
    if (!mintEntries || typeof mintEntries !== 'object') return

    Object.entries(mintEntries).forEach(([underlyingMint, value]) => {
      if (!isNonEmptyString(underlyingMint)) return

      const amount = parseManagedAumAmountRaw(value)
      if (!amount) return

      api.add(underlyingMint, amount)
    })
  })
}

/**
 * Computes Exponent TVL from onchain SY supply and the DefiLlama payload that
 * maps quote amounts into the final base mint, then adds external managed AUM.
 */
async function tvl(api) {
  const provider = getProvider()
  const connection = getConnection()
  const program = new Program(idl, provider)

  await addCoreTvl(api, program, connection)
  await addManagedVaultAum(api)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated by summing the total supply of each Exponent wrapped yield-bearing token, converting SY raw supply into quote raw amount via the onchain last seen SY exchange rate, and then remapping that quote amount into the DefiLlama base mint when needed. For kamino and marginfi, the base mint remains the quote asset; otherwise the quote amount is converted into underlying asset units. External AUM from managed vaults is added separately, while Exponent internal protocol exposure is excluded to avoid double counting.',
  solana: { tvl },
}
