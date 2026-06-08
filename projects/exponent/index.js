const { getConnection, getProvider } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const { decodeAccount } = require('../helper/utils/solana/layout')
const { Program } = require('@coral-xyz/anchor')

const { getConfig } = require('../helper/cache')
const idl = require('./idl.json')
const {
  fetchStrategyVaultAums,
  resolveManagedUnderlyingMint,
} = require('./strategyVaults')

const EXPONENT_API_V2_BASE = 'https://api.exponent.finance'
const DEFILLAMA_SY_PAYLOAD_URL = `${EXPONENT_API_V2_BASE}/defillama/sy-payload`
const DEFILLAMA_MANAGED_VAULTS_PAYLOAD_URL = `${EXPONENT_API_V2_BASE}/defillama/managed-vaults-payload`

// Exponent stores the SY exchange rate with 1e12 fixed-point precision.
const SY_EXCHANGE_RATE_SCALE = 12n

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

/**
 * Validates a DefiLlama managed vaults payload row and returns the fields needed
 * to convert position AUM from strategy vault underlying raw units into the
 * resolved position underlying mint raw units.
 */
function parseManagedVaultsPayloadEntry(entry) {
  if (!entry || typeof entry !== 'object') return null

  const {
    strategyVaultUnderlyingMint,
    positionMint,
    positionUnderlyingMint,
    underlyingToPositionUnderlyingRate,
    underlyingToPositionUnderlyingRateScale,
  } = entry

  if (!isNonEmptyString(strategyVaultUnderlyingMint)) return null
  if (!isNonEmptyString(positionMint)) return null
  if (!isNonEmptyString(positionUnderlyingMint)) return null
  if (!isNonEmptyString(underlyingToPositionUnderlyingRate)) return null
  if (!isNonNegativeInteger(underlyingToPositionUnderlyingRateScale)) return null

  return {
    strategyVaultUnderlyingMint,
    positionMint,
    positionUnderlyingMint,
    underlyingToPositionUnderlyingRate,
    underlyingToPositionUnderlyingRateScale,
  }
}

function buildManagedVaultsPayloadKey(strategyVaultUnderlyingMint, positionMint) {
  return `${strategyVaultUnderlyingMint}:${positionMint}`
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

  if (!Array.isArray(syPayload)) {
    throw new Error('Invalid exponent-defillama-sy-payload response: expected array')
  }

  const syPayloadByMint = new Map()

  syPayload.forEach((entry) => {
    const parsedEntry = parseSyPayloadEntry(entry)
    if (!parsedEntry) return

    syPayloadByMint.set(parsedEntry.mintSy, parsedEntry)
  })

  return syPayloadByMint
}

async function fetchManagedVaultsPayloadByKey() {
  const payload = await getConfig(
    'exponent-defillama-managed-vaults-payload',
    DEFILLAMA_MANAGED_VAULTS_PAYLOAD_URL
  )

  if (!Array.isArray(payload)) {
    throw new Error('Invalid exponent-defillama-managed-vaults-payload response: expected array')
  }

  const payloadByKey = new Map()

  payload.forEach((entry) => {
    const parsedEntry = parseManagedVaultsPayloadEntry(entry)
    if (!parsedEntry) return

    payloadByKey.set(
      buildManagedVaultsPayloadKey(parsedEntry.strategyVaultUnderlyingMint, parsedEntry.positionMint),
      parsedEntry
    )
  })

  return payloadByKey
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

async function addManagedVaultAum(api, connection) {
  const [managedVaultAums, managedVaultsPayloadByKey] = await Promise.all([
    fetchStrategyVaultAums(connection),
    fetchManagedVaultsPayloadByKey().catch((error) => {
      console.warn('Failed to fetch Exponent managed vaults payload, using vault underlying fallback', error)
      return new Map()
    }),
  ])

  managedVaultAums.forEach(({ underlyingMint, aumResults }) => {
    if (!isNonEmptyString(underlyingMint)) return
    if (!Array.isArray(aumResults)) return

    aumResults.forEach((result) => {
      if (!result || typeof result !== 'object') return
      if (!isNonEmptyString(result.mint)) return
      if (result.aum <= 0n) return

      const payload = managedVaultsPayloadByKey.get(buildManagedVaultsPayloadKey(underlyingMint, result.mint))
      if (!payload) {
        console.log("api.add", resolveManagedUnderlyingMint(underlyingMint), result.aum)
        api.add(resolveManagedUnderlyingMint(underlyingMint), result.aum)
        return
      }

      const amount = convertQuoteRawToBaseRaw({
        quoteRaw: result.aum,
        quoteToBaseRate: payload.underlyingToPositionUnderlyingRate,
        quoteToBaseRateScale: payload.underlyingToPositionUnderlyingRateScale,
      })
      if (!amount) return

      console.log("api.add",resolveManagedUnderlyingMint(payload.positionUnderlyingMint), amount)
      api.add(resolveManagedUnderlyingMint(payload.positionUnderlyingMint), amount)
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
  await addManagedVaultAum(api, connection)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated by summing the total supply of each Exponent wrapped yield-bearing token, converting SY raw supply into quote raw amount via the onchain last seen SY exchange rate, and then remapping that quote amount into the DefiLlama base mint when needed. For kamino and marginfi, the base mint remains the quote asset; otherwise the quote amount is converted into underlying asset units. Managed vault position AUM is calculated from onchain Exponent strategy vault accounts and remapped through Exponent-provided resolver rates from each strategy vault underlying mint into each position underlying mint.',
  solana: { tvl },
}
