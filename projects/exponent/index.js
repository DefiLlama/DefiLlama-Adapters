const { getConnection, getProvider } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { decodeAccount } = require("../helper/utils/solana/layout");
const { Program } = require("@coral-xyz/anchor");

const { getConfig } = require('../helper/cache')
const { getTranchingMarkets, getTranchingNavBySyMint } = require("../exponent-tranching/helpers")
const NUMBER_DENOM = 1_000_000_000_000n
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
  const tranchingMarkets = await getTranchingMarkets()
  const tranchingNavBySyMint = getTranchingNavBySyMint(tranchingMarkets)
  
  const mintRateMap = {}
  const mintAccountMap = {}
  
  vaults.forEach(v => {
    const rate = BigInt(v.account.lastSeenSyExchangeRate[0][0].toString())
    if (rate > 0)
      mintRateMap[v.account.mintSy.toString()] = rate
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
    const supply = BigInt(decodedMint.supply.toString());

    // As all of the Exponent wrapped tokens are yield bearing tokens, mutiply their supply by their redemption rate to get the base asset amount
    const coreAmount = supply * mintRate / NUMBER_DENOM;
    const tranchingAmount = tranchingNavBySyMint[mintSy] || 0n;
    // Core counts total SY supply, including SY deposited into tranching markets.
    // Tranching NAV is already in raw accounting/base units, so subtract it without applying mintRate again.
    const amount = coreAmount > tranchingAmount ? coreAmount - tranchingAmount : 0n;

    // Add to balances using the base asset price * the converted amount of base tokens
    api.add(mintUnderlying, amount.toString());
  }
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing the total supply of each Exponent wrapped Yield bearing token, excluding SY liquidity deposited into Exponent Tranching markets, and multiplying the remaining base asset amount by the price of the underlying token",
  solana: { tvl },
};
