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

const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

let _rpc;

function getRpc() {
  if (_rpc !== undefined) {
    return _rpc;
  }

  const defaultTransport = createDefaultRpcTransport({ url: endpoint });

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
 * Gets total balances in accounts owned by the given address.
 *
 * @returns A record of mint address to total balance.
 */
async function getTokenBalances(owner, tokenProgram = TOKEN_PROGRAM_ID) {
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

module.exports = {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getRpc,
  getTokenBalances,
  mergeBalances,
};
