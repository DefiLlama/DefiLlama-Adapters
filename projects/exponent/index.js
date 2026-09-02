const { getConnection, getProvider } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { decodeAccount } = require("../helper/utils/solana/layout");
const { Program } = require("@coral-xyz/anchor");

const { getConfig } = require('../helper/cache')
const { fetchURL } = require('../helper/utils')

// A Generic SY mint wraps a yield-bearing token one for one, and the SY program
// records which token that is. Attributing to it rather than to the market's base
// asset is what lets an asset with its own price show up under its own name: the
// ONyc market, for example, is booked under USDe today, so ~$44M of ONyc PT is
// reported as a stablecoin. projects/exponent-tranching already reads the same
// field for the same reason.
const GENERIC_SY_PROGRAM_ID = 'XP1BRLn8eCYSygrd8er5P4GKdzqKbC3DLoSsS5UYVZy'
const SY_META_DISCRIMINATOR = Buffer.from([254, 147, 136, 16, 163, 203, 98, 93])
const SY_META_MINT_SY_OFFSET = 8
const SY_META_YIELD_BEARING_MINT_OFFSET = 129
const SY_META_MIN_LENGTH = SY_META_YIELD_BEARING_MINT_OFFSET + 32

// Reads the SY program's own metadata accounts, so a market added later is picked
// up without touching this file.
async function getGenericSyYieldBearingMints(connection) {
  const accounts = await connection.getProgramAccounts(new PublicKey(GENERIC_SY_PROGRAM_ID))

  const map = {}
  accounts.forEach(({ account }) => {
    const { data } = account
    if (data.length < SY_META_MIN_LENGTH) return
    if (!Buffer.from(data.subarray(0, 8)).equals(SY_META_DISCRIMINATOR)) return
    const mintSy = new PublicKey(data.subarray(SY_META_MINT_SY_OFFSET, SY_META_MINT_SY_OFFSET + 32))
    const yieldBearingMint = new PublicKey(data.subarray(
      SY_META_YIELD_BEARING_MINT_OFFSET,
      SY_META_YIELD_BEARING_MINT_OFFSET + 32,
    ))
    map[mintSy.toBase58()] = yieldBearingMint.toBase58()
  })
  return map
}

// Not every yield-bearing mint has a price (Carrot and Reflect USDC+ are two that
// do not today). Repointing one of those would drop its market to zero, so the base
// asset stays the fallback. Asking the price service beats hardcoding the list: a
// mint that gets a price later starts attributing correctly on its own, and one that
// loses its price falls back instead of vanishing, neither needing a change here.
async function getPricedMints(mints) {
  if (mints.length === 0) return new Set()
  const priced = new Set()
  for (let i = 0; i < mints.length; i += 50) {
    const batch = mints.slice(i, i + 50)
    const { data } = await fetchURL(
      `https://coins.llama.fi/prices/current/${batch.map(m => `solana:${m}`).join(',')}`
    )
    batch.forEach(mint => {
      if (data?.coins?.[`solana:${mint}`]?.price > 0) priced.add(mint)
    })
  }
  return priced
}
const idl = {
  "address": "ExponentnaRg3CQbW6dqQNZKXp7gtZ9DGMp1cwC4HAS7",
  "metadata": {"name": "exponent_core", "version": "0.1.0", "spec": "0.1.0", "description": "Created with Anchor"},
  "instructions": [],
  "accounts": [{"name": "Vault", "discriminator": [211, 8, 232, 43, 2, 152, 117, 119]}],
  "events": [],
  "errors": [],
  "types": [
    {
      "name": "Vault",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "sy_program", "docs": ["Link to SY program"], "type": "pubkey"},
          {"name": "mint_sy", "docs": ["Mint for SY token"], "type": "pubkey"},
          {"name": "mint_yt", "docs": ["Mint for the vault-specific YT token"], "type": "pubkey"},
          {"name": "mint_pt", "docs": ["Mint for the vault-specific PT token"], "type": "pubkey"},
          {"name": "escrow_yt", "docs": ["Escrow account for holding deposited YT"], "type": "pubkey"},
          {
            "name": "escrow_sy",
            "docs": ["Escrow account that holds temporary SY tokens", "As an interchange between users and the SY program"],
            "type": "pubkey"
          },
          {
            "name": "yield_position",
            "docs": ["Link to a vault-owned YT position", "This account collects yield from all unstaked YT"],
            "type": "pubkey"
          },
          {"name": "address_lookup_table", "docs": ["Address lookup table key for vault"], "type": "pubkey"},
          {"name": "start_ts", "docs": ["start timestamp"], "type": "u32"},
          {"name": "duration", "docs": ["seconds duration"], "type": "u32"},
          {"name": "signer_seed", "docs": ["Seed for CPI signing"], "type": "pubkey"},
          {"name": "authority", "docs": ["Authority for CPI signing"], "type": "pubkey"},
          {"name": "signer_bump", "docs": ["bump for signer authority PDA"], "type": {"array": ["u8", 1]}},
          {
            "name": "last_seen_sy_exchange_rate",
            "docs": [
              "Last seen SY exchange rate",
              "Not needed for live use, but only when the vault has matured, and we need to freeze earnings for YT holders",
              "This will not get updated after vault is mautured"
            ],
            "type": {"defined": {"name": "Number"}}
          },
          {
            "name": "all_time_high_sy_exchange_rate",
            "docs": ["This is the all time high exchange rate for SY"],
            "type": {"defined": {"name": "Number"}}
          },
          {
            "name": "final_sy_exchange_rate",
            "docs": ["This is the exchange rate for SY when the vault expires"],
            "type": {"defined": {"name": "Number"}}
          },
          {"name": "total_sy_in_escrow", "docs": ["How much SY is held in escrow"], "type": "u64"},
          {
            "name": "sy_for_pt",
            "docs": [
              "The total SY set aside to back the PT holders",
              "This value is updated on every operation that touches the PT supply or the last seen exchange rate"
            ],
            "type": "u64"
          },
          {"name": "pt_supply", "docs": ["Total supply of PT"], "type": "u64"},
          {"name": "treasury_sy", "docs": ["Amount of SY staged for the treasury"], "type": "u64"},
          {"name": "uncollected_sy", "docs": ["SY that has been earned by YT, but not yet collected"], "type": "u64"},
          {
            "name": "treasury_sy_token_account",
            "docs": [
              "SY that has been staged for collection, but not yet collected",
              "It is strictly greater-than-or-equal to the treasury_sy",
              "And strictly less than or equal to the total_sy_in_escrow"
            ],
            "type": "pubkey"
          },
          {"name": "interest_bps_fee", "type": "u16"},
          {"name": "min_op_size_strip", "type": "u64"},
          {"name": "min_op_size_merge", "type": "u64"},
          {"name": "status", "type": "u8"}
        ]
      }
    },
    {
      "name": "Number",
      "docs": ["High precision number, stored as 4 u64 words in little endian"],
      "type": {"kind": "struct", "fields": [{"array": ["u64", 4]}]}
    }
  ]
};


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

  const yieldBearingMints = await getGenericSyYieldBearingMints(connection)
  const pricedYieldBearingMints = await getPricedMints([...new Set(
    mints.map(({ mintSy }) => yieldBearingMints[mintSy]).filter(Boolean)
  )])

  for (let i = 0; i < mints.length; i++) {
    const { mintSy, mintUnderlying} = mints[i]
    const mintAccount = mintAccountMap[mintSy]
    const mintRate = mintRateMap[mintSy]
    if (!mintAccount || !mintRate) continue;

    // Decode mint data
    const decodedMint = decodeAccount('mint', mintAccount);
    const supply = decodedMint.supply;

    const yieldBearingMint = yieldBearingMints[mintSy]
    if (yieldBearingMint && pricedYieldBearingMints.has(yieldBearingMint)) {
      // The SY wraps its yield-bearing token one for one, so the supply IS the
      // amount held, and no rate is applied: mintRate is a price ratio against the
      // base asset, and using it here would apply the yield-bearing token's premium
      // a second time on top of its own price.
      api.add(yieldBearingMint, supply);
      continue;
    }

    // As all of the Exponent wrapped tokens are yield bearing tokens, mutiply their supply by their redemption rate to get the base asset amount
    const amount = supply * mintRate;

    // Add to balances using the base asset price * the converted amount of base tokens
    api.add(mintUnderlying, amount);
  }
}

module.exports = {
  timetravel: false,
  methodology: "TVL is the total supply of each Exponent wrapped yield-bearing token. Generic SY markets are attributed to the yield-bearing mint the SY program records on-chain, which the SY wraps one for one. A market whose yield-bearing mint has no price falls back to the market's base asset, valued as supply times the SY exchange rate.",
  solana: { tvl },
};
