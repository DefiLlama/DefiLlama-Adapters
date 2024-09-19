const { getAddressDecoder } = require("@solana/addresses");
const { getBase64Encoder, getU64Decoder } = require("@solana/codecs");

const { getRpc, getTokenBalances, mergeBalances } = require("./utils");

const programId = "P2PzLraW8YF87BxqZTZ5kgrfvzcrKGPnqUBNhqmcV9B";
const poolOwner = "J9EH18EWSo8s69gouHGNy5zFHkhcHRbb9zBZXwSG4cHy";

async function getAwaitingClaim() {
  return getTokenBalances(poolOwner);
}

async function getDeposits() {
  const rpc = getRpc();

  const result = await rpc
    .getProgramAccounts(programId, {
      encoding: "base64",
      // We only care about:
      // - mint address (73..105)
      // - yes amount (113..121)
      // - no amount (121..129)
      dataSlice: { offset: 73, length: 56 },
      filters: [
        // Market accounts have a discriminator of 3 at offset 0.
        { memcmp: { offset: 0n, bytes: "4", encoding: "base58" } },
        // Open markets have a state of 0 at offset 129.
        { memcmp: { offset: 129n, bytes: "1", encoding: "base58" } },
      ],
    })
    .send();

  const base64Encoder = getBase64Encoder();

  const addressDecoder = getAddressDecoder();
  const u64Decoder = getU64Decoder();

  const deposits = {};

  for (const { account } of result) {
    const data = base64Encoder.encode(account.data[0]);

    // Mint address is at offset 73 + 0.
    const mint = addressDecoder.decode(data, 0);
    // Yes amounts is a u64 at offset 73 + 40.
    const yesAmount = u64Decoder.decode(data, 40);
    // Yes amounts is a u64 at offset 73 + 48.
    const noAmount = u64Decoder.decode(data, 48);

    deposits[mint] = (deposits[mint] ?? 0n) + yesAmount + noAmount;
  }

  return deposits;
}

async function tvl() {
  const balances = await Promise.all([getAwaitingClaim(), getDeposits()]);

  return mergeBalances(...balances);
}

module.exports = { tvl };
