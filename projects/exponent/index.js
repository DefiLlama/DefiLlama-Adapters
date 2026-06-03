const { getConnection, getProvider } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { decodeAccount } = require("../helper/utils/solana/layout");
const { Program } = require("@coral-xyz/anchor");

const { getConfig } = require('../helper/cache')
const idl = require('./idl.json')

const EXPONENT_CORE_PROGRAM_ID = 'ExponentnaRg3CQbW6dqQNZKXp7gtZ9DGMp1cwC4HAS7'
const EXPONENT_CLMM_PROGRAM_ID = 'XPC1MM4dYACDfykNuXYZ5una2DsMDWL24CrYubCvarC'
const EXPONENT_ORDERBOOK_PROGRAM_ID = 'XPBookgQTN2p8Yw1C2La35XkPMmZTCEYH77AdReVvK1'
// Exponent stores the SY exchange rate with 1e12 fixed-point precision.
const SY_EXCHANGE_RATE_SCALE = 12n

// These protocol buckets are already represented by core vault accounting, so
// adding managed-strategy exposure back into them would double count TVL.
const EXPONENT_INTERNAL_PROTOCOL_KEYS = new Set([
  EXPONENT_CORE_PROGRAM_ID,
  EXPONENT_CLMM_PROGRAM_ID,
  EXPONENT_ORDERBOOK_PROGRAM_ID,
])

// const EXPONENT_API_V2_BASE = 'https://api.exponent.finance'
const EXPONENT_API_V2_BASE = 'http://localhost:3000/api'

function getLastSeenSyExchangeRateRaw(vaultAccount) {
  const rawRate = vaultAccount?.lastSeenSyExchangeRate?.[0]?.[0]
  if (rawRate == null) return null

  const rate = BigInt(rawRate.toString())
  return rate > 0n ? rate : null
}

async function addManagedVaultAum(api) {
  // Managed strategies can deploy capital into external protocols that are not
  // visible from core SY/PT/YT supply alone, so fetch that exposure separately.
  const managedAum = await getConfig(
    'exponent-managed-total-aum',
    `${EXPONENT_API_V2_BASE}/strategies/managed/total-aum`
  )

  Object.entries(managedAum || {}).forEach(([protocolKey, mintEntries]) => {
    // Skip Exponent-internal venues: that capital is already counted in core TVL.
    if (EXPONENT_INTERNAL_PROTOCOL_KEYS.has(protocolKey)) return;
    if (!mintEntries || typeof mintEntries !== 'object') return;

    Object.entries(mintEntries).forEach(([underlyingMint, value]) => {
      if (!value || typeof value !== 'object') return;

      const amountRaw = value.aumUnderlyingRaw ?? value.amountRaw
      if (typeof amountRaw !== 'string') return;

      const amount = BigInt(amountRaw)
      if (amount <= 0n) return;
      api.add(underlyingMint, amount)
    })
  })
}

async function tvl(api) {
  const provider = getProvider()
  const connection = getConnection()
  
  const program = new Program(idl, provider)
  const vaultAccounts = await program.account.vault.all()
  const syExchangeRateBySyMint = {}
  const syMintAccountMap = {}

  vaultAccounts.forEach((vault) => {
    const mintSy = vault.account.mintSy.toString()
    const syExchangeRateRaw = getLastSeenSyExchangeRateRaw(vault.account)
    if (syExchangeRateRaw) {
      syExchangeRateBySyMint[mintSy] = syExchangeRateRaw
    }
  })

  // Fetch SY mint accounts so we can read total supply.
  const syMintPubkeys = Object.keys(syExchangeRateBySyMint).map((k) => new PublicKey(k))
  const syMintAccounts = await connection.getMultipleAccountsInfo(syMintPubkeys);

  syMintAccounts.forEach((a, i) => {
    syMintAccountMap[syMintPubkeys[i].toString()] = a
  })
  
  // quoteMint is the asset produced by the onchain SY exchange rate.
  // baseMint is the mint DefiLlama TVL should be attributed to for this SY.
  // For kamino and marginfi, baseMint stays quote_asset.
  // Otherwise, quote amounts are converted into underlying_asset units.
  //
  // quoteToBaseRate converts quote raw amount -> baseMint raw amount.
  // Consumers must compute:
  //   baseRaw = floor(quoteRaw * quoteToBaseRate / 10^quoteToBaseRateScale)
  const syPayload = await getConfig(
    'exponent-defillama-sy-payload',
    `${EXPONENT_API_V2_BASE}/defillama/sy-payload`
  );
  const syPayloadBySyMint = new Map((Array.isArray(syPayload) ? syPayload : []).map((entry) => [entry.mintSy, entry]));
  
  for (const [mintSy, payload] of syPayloadBySyMint.entries()) {
    const mintAccount = syMintAccountMap[mintSy]
    if (!mintAccount) continue;

    const syExchangeRateRaw = syExchangeRateBySyMint[mintSy]
    if (!syExchangeRateRaw) continue;

    const { baseMint, quoteToBaseRate, quoteToBaseRateScale } = payload
    if (
      typeof baseMint !== 'string' ||
      typeof quoteToBaseRate !== 'string' ||
      typeof quoteToBaseRateScale !== 'number'
    ) {
      continue;
    }

    // Read SY total supply from the mint account.
    const decodedMint = decodeAccount('mint', mintAccount);
    const supply = BigInt(decodedMint.supply.toString());

    // lastSeenSyExchangeRate converts SY raw amount -> quote raw amount.
    const quoteRaw = (supply * syExchangeRateRaw) / (10n ** SY_EXCHANGE_RATE_SCALE)
    if (quoteRaw <= 0n) continue;

    const scaleDenominator = 10n ** BigInt(quoteToBaseRateScale)
    const amount = (quoteRaw * BigInt(quoteToBaseRate)) / scaleDenominator
    if (amount <= 0n) continue;

    // Add to balances using the resolved base mint and precomputed quote-to-base rate.
    api.add(baseMint, amount);
  }

  // Add only external managed-strategy exposure on top of core TVL.
  await addManagedVaultAum(api)
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing the total supply of each Exponent wrapped yield-bearing token, converting SY raw supply into quote raw amount via the onchain last seen SY exchange rate, and then remapping that quote amount into the DefiLlama base mint when needed. For kamino and marginfi, the base mint remains the quote asset; otherwise the quote amount is converted into underlying asset units. External AUM from managed vaults is added separately, while Exponent internal protocol exposure is excluded to avoid double counting.",
  solana: { tvl },
};
