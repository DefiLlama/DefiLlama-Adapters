const { getAddressDecoder } = require("@solana/addresses");
const {
  getBase64Encoder,
  getU64Decoder,
  getU32Decoder,
} = require("@solana/codecs");

const { getRpc, getTokenBalances, mergeBalances } = require("./utils");

const programId = "PLYaNRbQs9GWyVQdcLrzPvvZu7NH4W2sneyHcEimLr7";
const poolOwner = "8Y46GkrbUqXnbs6kPD6SWr44NjcKPEWYzvpAn8UB5duR";

async function getAwaitingClaim() {
  return getTokenBalances(poolOwner);
}

async function getDeposits() {
  const rpc = getRpc();

  const result = await rpc
    .getProgramAccounts(programId, {
      encoding: "base64",
      // We only care about:
      // - mint address (69..101)
      // - entry count (101..105)
      // - entry cost (105..113)
      dataSlice: { offset: 69, length: 44 },
      filters: [
        // Market accounts have a discriminator of 3 at offset 0.
        { memcmp: { offset: 0n, bytes: "4", encoding: "base58" } },
        // Open markets have a state of 0 at offset 149.
        { memcmp: { offset: 149n, bytes: "1", encoding: "base58" } },
      ],
    })
    .send();

  const base64Encoder = getBase64Encoder();

  const addressDecoder = getAddressDecoder();
  const u32Decoder = getU32Decoder();
  const u64Decoder = getU64Decoder();

  const deposits = {};

  for (const { account } of result) {
    const data = base64Encoder.encode(account.data[0]);

    // Mint address is at offset 69 + 0.
    const mint = addressDecoder.decode(data, 0);
    // Entry count is a u32 at offset 69 + 32.
    const entryCount = u32Decoder.decode(data, 32);
    // Entry cost is a u64 at offset 69 + 36.
    const entryCost = u64Decoder.decode(data, 36);

    deposits[mint] = (deposits[mint] ?? 0n) + BigInt(entryCount) * entryCost;
  }

  return deposits;
}

async function tvl() {
  const balances = await Promise.all([getAwaitingClaim(), getDeposits()]);

  return mergeBalances(...balances);
}

module.exports = { tvl };
