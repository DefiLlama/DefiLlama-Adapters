const { AddressLookupTableAccount, PublicKey } = require("@solana/web3.js");
const { getConnection, getProvider } = require("../helper/solana");
const { Program } = require("@coral-xyz/anchor");

const idl = require("./idl.json");

// Broken legacy tranching market with a different account layout.
// Exclude it explicitly to avoid deserialization errors.
const HIDDEN_TRANCHING_MARKET_ADDRESSES = new Set([
  'FkGQbWytiEnLbVDaBT85hyDxqKXmzHJ21GYpEpguSDSk',
])
const TRANCHING_MARKET_DISCRIMINATOR = Buffer.from([119, 38, 120, 122, 60, 24, 58, 160])
const GENERIC_SY_PROGRAM_ID = 'XP1BRLn8eCYSygrd8er5P4GKdzqKbC3DLoSsS5UYVZy'
const SY_META_DISCRIMINATOR = Buffer.from([254, 147, 136, 16, 163, 203, 98, 93])
const GENERIC_SY_META_YIELD_BEARING_MINT_OFFSET = 129
// Tranching Number is fixed-point with 12 decimal places.
const NUMBER_DENOM = 1_000_000_000_000n

function anchorNumberToRaw(value) {
  const words = Array.isArray(value?.[0]) ? value[0] : value
  return words.reduce((sum, word, index) => sum + (BigInt(word.toString()) << (64n * BigInt(index))), 0n)
}

function scaleTranchingNavToTokenRaw(value) {
  // Effective NAV is already denominated in the market accounting asset. DefiLlama expects raw token units.
  return value / NUMBER_DENOM
}

function getAltAddress(lookupTable, context) {
  const index = context?.altIndex
  if (index === undefined) return null
  return lookupTable?.state?.addresses?.[index] || null
}

function hasTranchingMarketDiscriminator(data) {
  return data.length >= 8 && Buffer.from(data.subarray(0, 8)).equals(TRANCHING_MARKET_DISCRIMINATOR)
}

function readGenericSyMetaMintSy(data) {
  return new PublicKey(data.subarray(8, 40))
}

function readGenericSyMetaYieldBearingMint(data) {
  return new PublicKey(data.subarray(
    GENERIC_SY_META_YIELD_BEARING_MINT_OFFSET,
    GENERIC_SY_META_YIELD_BEARING_MINT_OFFSET + 32,
  ))
}

async function getTranchingMarkets() {
  const provider = getProvider()
  const program = new Program(idl, provider)
  const rawAccounts = await provider.connection.getProgramAccounts(program.programId, { commitment: "confirmed" })

  return rawAccounts
    .filter(
      ({ pubkey, account }) =>
        !HIDDEN_TRANCHING_MARKET_ADDRESSES.has(pubkey.toBase58()) &&
        hasTranchingMarketDiscriminator(account.data)
    )
    .map(({ pubkey, account }) => ({
      pubkey,
      account: program.coder.accounts.decode("exponentTranchingMarket", account.data),
    }))
    .filter(({ account }) => !HIDDEN_TRANCHING_MARKET_ADDRESSES.has(account.selfAddress.toBase58()))
}

async function getTranchingMarketTokenMints(markets) {
  const connection = getConnection()
  // Tranching markets store CPI account indices into their ALT, so resolve the ALT before looking for SY metadata.
  const lookupTableKeys = [...new Set(markets.map(({ account }) => account.addressLookupTable.toBase58()))]
    .map((address) => new PublicKey(address))
  const lookupTableAccounts = await connection.getMultipleAccountsInfo(lookupTableKeys)
  const lookupTables = {}

  lookupTableAccounts.forEach((account, index) => {
    if (!account) return
    const key = lookupTableKeys[index]
    lookupTables[key.toBase58()] = new AddressLookupTableAccount({
      key,
      state: AddressLookupTableAccount.deserialize(account.data),
    })
  })

  const map = {}
  const syMetaCandidates = []

  for (const { account } of markets) {
    const syMint = account.syMint.toBase58()
    // Default to the SY mint. Generic SY can be resolved further on-chain to its yield-bearing mint below.
    map[syMint] = new PublicKey(syMint)

    // Only Generic SY standard supports on-chain yield-bearing mint resolution here.
    if (account.syProgram.toBase58() !== GENERIC_SY_PROGRAM_ID) continue

    const lookupTable = lookupTables[account.addressLookupTable.toBase58()]
    // Generic SY markets include syMeta in depositSy[1] on newer account sets, or getSyState[0] on older ones.
    const candidate =
      getAltAddress(lookupTable, account.syCpiAccounts.depositSy?.[1]) ||
      getAltAddress(lookupTable, account.syCpiAccounts.getSyState?.[0])
    if (candidate) syMetaCandidates.push({ syMint, candidate })
  }

  const syMetaAccounts = syMetaCandidates.length > 0
    ? await connection.getMultipleAccountsInfo(syMetaCandidates.map(({ candidate }) => candidate))
    : []

  syMetaAccounts.forEach((account, index) => {
    if (!account) return
    if (!account.owner.equals(new PublicKey(GENERIC_SY_PROGRAM_ID))) return
    if (!Buffer.from(account.data.subarray(0, 8)).equals(SY_META_DISCRIMINATOR)) return

    const { syMint } = syMetaCandidates[index]
    if (!readGenericSyMetaMintSy(account.data).equals(new PublicKey(syMint))) return

    // Attribute Generic SY TVL to the on-chain yield-bearing mint so DefiLlama can price it directly.
    map[syMint] = readGenericSyMetaYieldBearingMint(account.data)
  })

  return map
}

function getTranchingNavBySyMint(markets) {
  const map = {}

  for (const { account } of markets) {
    const total =
      anchorNumberToRaw(account.financials.srEffectiveNetAsset) +
      anchorNumberToRaw(account.financials.jrEffectiveNetAsset)
    const amount = scaleTranchingNavToTokenRaw(total)
    if (amount <= 0n) continue

    const syMint = account.syMint.toBase58()
    map[syMint] = (map[syMint] || 0n) + amount
  }

  return map
}

// This shared helper keeps standalone tranching TVL and core TVL subtraction on the same NAV source.
// Without it, SY deposited into tranching can be counted once in total SY supply and again in tranching TVL.
module.exports = {
  getTranchingMarkets,
  getTranchingMarketTokenMints,
  getTranchingNavBySyMint,
}
