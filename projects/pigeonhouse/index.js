/**
 * DefiLlama TVL Adapter for PigeonHouse
 * Repo: https://github.com/DefiLlama/DefiLlama-Adapters
 * Path: projects/pigeonhouse/index.js
 *
 * Calculates TVL by summing quote token reserves held in active bonding curve PDAs.
 * Graduated tokens are excluded as their liquidity migrates to Raydium CPMM.
 */

const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { createHash } = require("crypto");

const PROGRAM_ID = "BV1RxkAaD5DjXMsnofkVikFUUYdrDg1v8YgsQ3iyDNoL";
const PIGEON_MINT = "4fSWEw2wbYEUCcMtitzmeGUfqinoafXxkhqZrA9Gpump";

/**
 * Fetches all active bonding curve accounts and sums their quote token reserves.
 * @returns {Promise<object>} Token balances aggregated by sumTokens2.
 */
async function tvl() {
  const connection = getConnection();
  const programId = new PublicKey(PROGRAM_ID);

  // BondingCurve account discriminator (first 8 bytes of sha256("account:BondingCurve"))
  const hash = createHash("sha256").update("account:BondingCurve").digest();
  const discriminator = hash.subarray(0, 8);

  // Fetch all bonding curve accounts from the program
  const accounts = await connection.getProgramAccounts(programId, {
    filters: [
      { memcmp: { offset: 0, bytes: require("bs58").encode(discriminator) } },
    ],
  });

  // Collect (owner, mint) pairs for sumTokens2 using tokensAndOwners format
  const tokensAndOwners = [];

  for (const { pubkey, account } of accounts) {
    const data = account.data;
    const DISC = 8;

    // BondingCurve layout (408 bytes, with quote_mint):
    //   [0..8]    discriminator
    //   [8..40]   token_mint (Pubkey)
    //   [40..72]  creator (Pubkey)
    //   [72..104] quote_mint (Pubkey)
    //   [104..112] virtual_pigeon_reserves (u64)
    //   [112..120] virtual_token_reserves (u64)
    //   [120..128] real_pigeon_reserves (u64)
    //   [128..136] real_token_reserves (u64)
    //   [136..144] token_total_supply (u64)
    //   [144]      complete (bool) <-- graduation flag

    // Detect layout version (408 = new with quote_mint, 376 = old without)
    const hasQuoteMint = data.length >= 408;
    let quoteMint = new PublicKey(PIGEON_MINT);

    if (hasQuoteMint) {
      quoteMint = new PublicKey(data.subarray(DISC + 64, DISC + 96));
    }

    // Check graduation: read the `complete` field
    // New layout: offset 144 (8 disc + 3*32 pubkeys + 5*8 u64s = 8+96+40 = 144)
    // Old layout: offset 112 (8 disc + 2*32 pubkeys + 5*8 u64s = 8+64+40 = 112)
    const completeOffset = hasQuoteMint ? 144 : 112;
    if (completeOffset < data.length && data[completeOffset] === 1) {
      continue; // Skip graduated tokens — liquidity is on Raydium
    }

    // Add bonding curve PDA as the owner of its quote token vault
    tokensAndOwners.push([quoteMint.toBase58(), pubkey.toBase58()]);
  }

  // sumTokens2 with tokensAndOwners resolves ATAs internally
  return sumTokens2({ tokensAndOwners });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology:
    "TVL is calculated by summing the quote token reserves (PIGEON, SOL, SKR) held in all active bonding curve PDAs. Graduated tokens are excluded as their liquidity migrates to Raydium CPMM.",
};
