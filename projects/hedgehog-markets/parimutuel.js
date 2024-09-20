//@ts-check

const { getAddressDecoder } = require("@solana/addresses");
const {
  getArrayDecoder,
  getBase64Encoder,
  getU64Decoder,
  getU8Decoder,
} = require("@solana/codecs");

const { getRpc, getTokenBalancesByOwner, mergeBalances } = require("./utils");

/**
 * @template {string} [TAddress=string]
 * @typedef {import("@solana/addresses").Address<TAddress>} Address
 */

const programId = /** @type {Address} */("PARrVs6F5egaNuz8g6pKJyU4ze3eX5xGZCFb3GLiVvu"); /* prettier-ignore */
const poolOwner = /** @type {Address} */("3SAUPiGiATqv8TBgvzSJqpLxLGF6LbJamvimueJQT7WT"); /* prettier-ignore */

async function getAwaitingClaim() {
  return getTokenBalancesByOwner(poolOwner);
}

async function getDeposits() {
  const rpc = getRpc();

  const result = await rpc
    .getProgramAccounts(programId, {
      encoding: "base64",
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
  const amountsDecoder = getArrayDecoder(getU64Decoder(), { size: getU8Decoder() }); /* prettier-ignore */

  /** @type {Record<Address, bigint>} */
  const deposits = {};

  for (const { account } of result) {
    const data = base64Encoder.encode(account.data[0]);

    // Mint address is at offset 69.
    const mint = addressDecoder.decode(data, 69);
    // Amounts is a u64 array with u8 size prefix at offset 131.
    const amounts = amountsDecoder.decode(data, 131);

    let deposit = deposits[mint] ?? 0n;
    for (const amount of amounts) {
      deposit += amount;
    }
    deposits[mint] = deposit;
  }

  return deposits;
}

async function tvl() {
  const balances = await Promise.all([getAwaitingClaim(), getDeposits()]);

  return mergeBalances(...balances);
}

module.exports = tvl;
