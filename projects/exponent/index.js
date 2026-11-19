const { getConnection, getProvider, sumTokens2, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { decodeAccount } = require("../helper/utils/solana/layout");
const { Program } = require("@coral-xyz/anchor");
const { getConfig } = require("../helper/cache");

// Exponent core: one Vault per market, recording the SY mint, the SY program that backs it and the
// SY -> base asset exchange rate.
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

// Generic SY program: an SY that wraps a yield-bearing token one for one. Its SyMeta account records
// which token that is, and the SyMeta PDA custodies the tokens in its associated token account.
const GENERIC_SY_PROGRAM = "XP1BRLn8eCYSygrd8er5P4GKdzqKbC3DLoSsS5UYVZy";
const SY_META_DISCRIMINATOR = Buffer.from([254, 147, 136, 16, 163, 203, 98, 93]);
const SY_META_MINT_SY_OFFSET = 8;
const SY_META_YIELD_BEARING_MINT_OFFSET = 129;
const SY_META_MIN_LENGTH = SY_META_YIELD_BEARING_MINT_OFFSET + 32;

async function getGenericSyVaults(connection) {
  const accounts = await connection.getProgramAccounts(new PublicKey(GENERIC_SY_PROGRAM), {
    dataSlice: { offset: 0, length: SY_META_MIN_LENGTH },
  });
  const vaults = {};
  for (const { pubkey, account: { data } } of accounts) {
    if (data.length < SY_META_MIN_LENGTH || !data.subarray(0, 8).equals(SY_META_DISCRIMINATOR)) continue;
    const mintSy = new PublicKey(data.subarray(SY_META_MINT_SY_OFFSET, SY_META_MINT_SY_OFFSET + 32)).toBase58();
    const yieldBearingMint = new PublicKey(data.subarray(SY_META_YIELD_BEARING_MINT_OFFSET, SY_META_MIN_LENGTH));
    vaults[mintSy] = { pda: pubkey, yieldBearingMint };
  }
  return vaults;
}

// Associated token account of the vault PDA for its yield-bearing mint, on whichever token program
// owns the mint.
function associatedTokenAccount(mint, owner, tokenProgram) {
  return PublicKey.findProgramAddressSync([owner.toBuffer(), tokenProgram.toBuffer(), mint.toBuffer()], ASSOCIATED_TOKEN_PROGRAM_ID)[0].toBase58();
}

async function tvl(api) {
  const connection = getConnection();
  const program = new Program(idl, getProvider());
  const [coreVaults, genericSyVaults, { data: mints }] = await Promise.all([
    program.account.vault.all(),
    getGenericSyVaults(connection),
    getConfig("exponent", "https://web-api.exponent.finance/api/lyt-growth/standard-yield-tokens"),
  ]);

  const vaultByMintSy = {};
  coreVaults.forEach((v) => {
    vaultByMintSy[v.account.mintSy.toString()] = {
      syProgram: v.account.syProgram.toString(),
      rate: v.account.lastSeenSyExchangeRate[0][0].toString() / 1e12,
    };
  });

  const generic = [];
  const rateBased = [];
  for (const { mintSy, mintUnderlying } of mints) {
    const vault = vaultByMintSy[mintSy];
    if (!vault) continue;
    const syVault = vault.syProgram === GENERIC_SY_PROGRAM ? genericSyVaults[mintSy] : undefined;
    if (syVault) generic.push(syVault);
    else if (vault.rate > 0) rateBased.push({ mintSy, mintUnderlying, rate: vault.rate });
  }

  // Generic SY markets: count the yield-bearing tokens the SY vault actually holds.
  const mintInfos = await connection.getMultipleAccountsInfo(generic.map((i) => i.yieldBearingMint));
  const tokenAccounts = generic.map(({ yieldBearingMint, pda }, i) => {
    const tokenProgram = mintInfos[i]?.owner.equals(TOKEN_2022_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
    return associatedTokenAccount(yieldBearingMint, pda, tokenProgram);
  });
  await sumTokens2({ api, tokenAccounts });

  // Markets on dedicated SY programs (Kamino, marginfi, Jito restaking, Perena) hold protocol positions
  // rather than tokens, so their SY supply is converted to the base asset at the vault exchange rate.
  const supplies = await connection.getMultipleAccountsInfo(rateBased.map((i) => new PublicKey(i.mintSy)));
  rateBased.forEach(({ mintUnderlying, rate }, i) => {
    if (!supplies[i]) return;
    api.add(mintUnderlying, decodeAccount("mint", supplies[i]).supply * rate);
  });
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing the total supply of each Exponent wrapped Yield bearing token and multiplying their base asset amount by the price of the underlying token",
  solana: { tvl },
};
