//@ts-check

const { getAddressDecoder } = require("@solana/addresses");
const { getBase64Encoder, getU64Decoder } = require("@solana/codecs");
const {
  isSolanaError,
  SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR,
} = require("@solana/errors");
const {
  createDefaultRpcTransport,
  createSolanaRpcFromTransport,
} = require("@solana/rpc");
const sdk = require("@defillama/sdk");

const { endpoint } = require("../helper/solana");
const { sleep } = require("../helper/utils");

/**
 * @template {string} [TAddress=string]
 * @typedef {import("@solana/addresses").Address<TAddress>} Address
 */

/**
 * @template TRpcMethods
 * @typedef {import("@solana/rpc").Rpc<TRpcMethods>} Rpc
 */

/** @typedef {import("@solana/rpc").RpcTransport} RpcTransport */
/** @typedef {import("@solana/rpc").SolanaRpcApiMainnet} SolanaRpcApiMainnet */

const TOKEN_PROGRAM_ID = /** @type {Address} */("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"); /* prettier-ignore */
const TOKEN_2022_PROGRAM_ID = /** @type {Address} */("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"); /* prettier-ignore */

/** @type {Rpc<SolanaRpcApiMainnet> | undefined} */
let _rpc;

/** @returns {Rpc<SolanaRpcApiMainnet>} */
function getRpc() {
  if (_rpc !== undefined) {
    return _rpc;
  }

  const defaultTransport = createDefaultRpcTransport({ url: endpoint });

  /** @type {RpcTransport} */
  const retryingTransport = async (...args) => {
    let attempt = 0;

    for (;;) {
      try {
        return await defaultTransport(...args);
      } catch (err) {
        if (
          attempt === 5 ||
          !isSolanaError(err, SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR) ||
          err.context.statusCode !== 429
        ) {
          throw err;
        }

        // Exponential backoff.
        const backoff = 400 * 2 ** attempt;

        sdk.log(
          `RPC responded with 429 Too Many Requests, retrying after ${backoff}ms`,
        );

        await sleep(backoff);

        attempt++;
      }
    }
  };

  return (_rpc = createSolanaRpcFromTransport(retryingTransport));
}

/**
 * Gets total balances in given token accounts.
 *
 * @param {Array<Address>} accounts
 * @returns {Promise<Record<Address, bigint>>} A record of mint address to total balance.
 */
async function getTokenBalances(accounts) {
  const rpc = getRpc();

  const base64Encoder = getBase64Encoder();
  const addressDecoder = getAddressDecoder();
  const u64Decoder = getU64Decoder();

  /** @type {Record<Address, bigint>} */
  const balances = {};

  await Promise.all(
    chunkArray(accounts, 100).map(async (chunk) => {
      const result = await rpc
        .getMultipleAccounts(chunk, {
          encoding: "base64",
          // We only need the mint address (0..32) and amount (64..72) in the account.
          dataSlice: { offset: 0, length: 72 },
        })
        .send();

      for (const account of result.value) {
        if (account === null) {
          continue;
        }
        const data = base64Encoder.encode(account.data[0]);

        // Mint address is at offset 0.
        const mint = addressDecoder.decode(data, 0);
        // Amount is a u64 at offset 64.
        const amount = u64Decoder.decode(data, 64);

        balances[mint] = (balances[mint] ?? 0n) + amount;
      }
    }),
  );

  return balances;
}

/**
 * Gets total balances in token accounts owned by the given address.
 *
 * @param {Address} owner
 * @param {Address} [tokenProgram]
 * @returns {Promise<Record<Address, bigint>>} A record of mint address to total balance.
 */
async function getTokenBalancesByOwner(owner, tokenProgram = TOKEN_PROGRAM_ID) {
  const rpc = getRpc();

  const result = await rpc
    .getTokenAccountsByOwner(
      owner,
      { programId: tokenProgram },
      {
        encoding: "base64",
        // We only need the mint address (0..32) and amount (64..72) in the account.
        dataSlice: { offset: 0, length: 72 },
      },
    )
    .send();

  const base64Encoder = getBase64Encoder();
  const addressDecoder = getAddressDecoder();
  const u64Decoder = getU64Decoder();

  /** @type {Record<Address, bigint>} */
  const balances = {};
  for (const { account } of result.value) {
    const data = base64Encoder.encode(account.data[0]);
    // Mint address is at offset 0.
    const mint = addressDecoder.decode(data, 0);
    // Amount is a u64 at offset 64.
    const amount = u64Decoder.decode(data, 64);
    balances[mint] = (balances[mint] ?? 0n) + amount;
  }
  return balances;
}

/**
 * @param  {...Record<Address, bigint>} balances
 * @returns {Record<Address, bigint>}
 */
function mergeBalances(...balances) {
  if (balances.length === 0) {
    return {};
  }
  const result = Object.assign({}, balances[0]);
  for (let i = 1; i < balances.length; i++) {
    for (const [mint, balance] of Object.entries(balances[i])) {
      result[mint] = (result[mint] ?? 0n) + balance;
    }
  }
  return result;
}

/**
 * @template T
 * @param {Array<T>} array
 * @param {number} [chunkSize]
 * @returns {Array<Array<T>>}
 */
function chunkArray(array, chunkSize = 100) {
  const nChunks = Math.ceil(array.length / chunkSize);
  const chunks = new Array(nChunks);

  for (let i = 0; i < nChunks; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;

    chunks[i] = array.slice(start, end);
  }

  return chunks;
}

module.exports = {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getRpc,
  getTokenBalances,
  getTokenBalancesByOwner,
  mergeBalances,
  chunkArray,
};
