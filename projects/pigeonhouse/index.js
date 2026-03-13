// DefiLlama TVL Adapter for PigeonHouse
// Repo: https://github.com/DefiLlama/DefiLlama-Adapters
// Path: projects/pigeonhouse/index.js

const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { createHash } = require("crypto");

const PROGRAM_ID = "BV1RxkAaD5DjXMsnofkVikFUUYdrDg1v8YgsQ3iyDNoL";
const PIGEON_MINT = "4fSWEw2wbYEUCcMtitzmeGUfqinoafXxkhqZrA9Gpump";
const SOL_MINT = "So11111111111111111111111111111111111111112";
const SKR_MINT = "SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3";

async function tvl() {
  const connection = getConnection();
  const programId = new PublicKey(PROGRAM_ID);

  // Get BondingCurve discriminator
  const hash = createHash("sha256").update("account:BondingCurve").digest();
  const discriminator = hash.subarray(0, 8);

  // Fetch all bonding curve accounts
  const accounts = await connection.getProgramAccounts(programId, {
    filters: [{ memcmp: { offset: 0, bytes: require("bs58").encode(discriminator) } }],
  });

  // Collect all bonding curve PDAs to sum their token balances
  const tokenAccounts = [];

  for (const { pubkey, account } of accounts) {
    const data = account.data;
    const DISC = 8;

    // Parse token_mint (offset 8, 32 bytes)
    const tokenMint = new PublicKey(data.subarray(DISC, DISC + 32));

    // Detect layout (new = 408 bytes with quote_mint, old = 376 bytes)
    const hasQuoteMint = data.length >= 408;
    let quoteMint = new PublicKey(PIGEON_MINT);

    if (hasQuoteMint) {
      quoteMint = new PublicKey(data.subarray(DISC + 64, DISC + 96));
    }

    // Check if graduated (skip graduated tokens — their liquidity is on Raydium)
    const graduatedOffset = hasQuoteMint ? DISC + 96 + 40 : DISC + 64 + 40;
    const isGraduated = data[graduatedOffset] === 1;
    if (isGraduated) continue;

    // The bonding curve PDA holds both quote tokens and launched tokens
    // We want to count the quote token reserves as TVL
    tokenAccounts.push({
      owner: pubkey.toBase58(),
      mint: quoteMint.toBase58(),
    });
  }

  // Use sumTokens2 to aggregate balances
  return sumTokens2({ tokenAccounts });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology:
    "TVL is calculated by summing the quote token reserves (PIGEON, SOL, SKR) held in all active bonding curve PDAs. Graduated tokens are excluded as their liquidity migrates to Raydium CPMM.",
};
