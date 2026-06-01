const { getConnection, getProvider } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { decodeAccount } = require("../helper/utils/solana/layout");
const { Program } = require("@coral-xyz/anchor");

const { getConfig } = require('../helper/cache')
const idl = require('./idl.json')

const EXPONENT_CORE_PROGRAM_ID = 'ExponentnaRg3CQbW6dqQNZKXp7gtZ9DGMp1cwC4HAS7'
const EXPONENT_CLMM_PROGRAM_ID = 'XPC1MM4dYACDfykNuXYZ5una2DsMDWL24CrYubCvarC'
const EXPONENT_ORDERBOOK_PROGRAM_ID = 'XPBookgQTN2p8Yw1C2La35XkPMmZTCEYH77AdReVvK1'
const SYNTHETIC_USD_MINT = 'USD1111111111111111111111111111111111111111'
const SYNTHETIC_USD9_MINT = 'USD1111111111111111111111111111111111111119'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const USDE_MINT = 'DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT'
// These protocol buckets are already represented by core vault accounting, so
// adding managed-strategy exposure back into them would double count TVL.
const EXPONENT_INTERNAL_PROTOCOL_KEYS = new Set([
  EXPONENT_CORE_PROGRAM_ID,
  EXPONENT_CLMM_PROGRAM_ID,
  EXPONENT_ORDERBOOK_PROGRAM_ID,
])

function resolveManagedUnderlyingMint(underlyingMint) {
  // Managed vaults can use synthetic quote mints for USD-denominated accounting.
  // DefiLlama needs a real priceable token mint, so normalize them to the same
  // assets used by the standard-yield-tokens endpoint.
  if (underlyingMint === SYNTHETIC_USD_MINT) return USDC_MINT
  if (underlyingMint === SYNTHETIC_USD9_MINT) return USDE_MINT
  return underlyingMint
}

async function addManagedVaultAum(api) {
  // Managed strategies can deploy capital into external protocols that are not
  // visible from the core SY/PT/YT supply alone, so that AUM is fetched from the
  // dedicated backend endpoint and added separately.
  const managedAum = await getConfig(
    'exponent-managed-total-aum',
    'https://www.exponent.finance/api/strategies/managed/totalAum'
  )

  Object.entries(managedAum || {}).forEach(([protocolKey, mintEntries]) => {
    // Skip Exponent-internal venues. Those positions are deployments of capital
    // that is already accounted for by the core vault TVL.
    if (EXPONENT_INTERNAL_PROTOCOL_KEYS.has(protocolKey)) return;
    if (!mintEntries || typeof mintEntries !== 'object') return;

    Object.entries(mintEntries).forEach(([underlyingMint, value]) => {
      if (!value || typeof value !== 'object') return;

      const { aumUnderlyingRaw } = value
      if (typeof aumUnderlyingRaw !== 'string') return;

      const amount = BigInt(aumUnderlyingRaw)
      if (amount <= 0n) return;
      api.add(resolveManagedUnderlyingMint(underlyingMint), amount)
    })
  })
}

async function tvl(api) {
  const provider = getProvider()
  const connection = getConnection()
  
  const program = new Program(idl, provider)
  const vaults = await program.account.vault.all()
  
  const mintRateMap = {}
  const mintAccountMap = {}
  
  vaults.forEach(v => {
    const rate = v.account.lastSeenSyExchangeRate[0][0].toString() / 1e12
    if (rate > 0)
      mintRateMap[v.account.mintSy.toString()] = v.account.lastSeenSyExchangeRate[0][0].toString() / 1e12
  })

  // Fetch mint accounts
  const mintPubkeys = Object.keys(mintRateMap).map(k => new PublicKey(k))
  const mintAccounts = await connection.getMultipleAccountsInfo(mintPubkeys);


  mintAccounts.forEach((a, i) => {
    mintAccountMap[mintPubkeys[i].toString()] = a
  })
  
  // Fetch Exponent wrapped mints from Exponent API
  const { data: mints } = await getConfig('exponent', 'https://web-api.exponent.finance/api/lyt-growth/standard-yield-tokens');
  

  for (let i = 0; i < mints.length; i++) {
    const { mintSy, mintUnderlying} = mints[i]
    const mintAccount = mintAccountMap[mintSy]
    const mintRate = mintRateMap[mintSy]
    if (!mintAccount || !mintRate) continue;

    // Decode mint data
    const decodedMint = decodeAccount('mint', mintAccount);
    const supply = decodedMint.supply;

    // As all of the Exponent wrapped tokens are yield bearing tokens, mutiply their supply by their redemption rate to get the base asset amount
    const amount = supply * mintRate;

    // Add to balances using the base asset price * the converted amount of base tokens
    api.add(mintUnderlying, amount);
  }

  // Add only external managed-strategy exposure on top of core TVL.
  await addManagedVaultAum(api)
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing the total supply of each Exponent wrapped Yield bearing token and multiplying their base asset amount by the price of the underlying token. External AUM from managed vaults is added separately, while Exponent internal protocol exposure is excluded to avoid double counting.",
  solana: { tvl },
};
