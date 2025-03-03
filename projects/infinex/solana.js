const ADDRESSES = require('../helper/coreAssets.json')
const axios = require("axios");
const { sleep } = require('../helper/utils');
const { blacklistedTokens_default, endpoint, transformBalances } = require('../helper/solana');
const { log } = require('@defillama/sdk');
const { sliceIntoChunks } = require('@defillama/sdk/build/util');
const { PublicKey } = require('@solana/web3.js');

// Address of the SPL Token program
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const TOKEN_PROGRAM_ID_BUFFER = TOKEN_PROGRAM_ID.toBuffer();

// Address of the SPL Associated Token Account program
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

async function sumTokens2Batched(
  { tokens, owners }
) {
  log("Calculating solana token accounts...")
  const tokenAccountsWithMints = tokens
    .filter((token) => !blacklistedTokens_default.includes(token))
    // this is synchronous and blocks propotional to the number of accounts
    .flatMap(token => owners.map(owner => [token, getAssociatedTokenAccountAddress(owner, token)]))
  const tokenAccounts = tokenAccountsWithMints.map(([_, tokenAccount]) => tokenAccount);

  const solBalances = await getSolBalances(owners);
  const splBalances = await getTokenAccountBalances(tokenAccounts);

  const solTokenBalances = solBalances.flatMap(balance => balance ? [[ADDRESSES.solana.SOL, balance]] : []);
  const splTokenBalances = splBalances.flatMap((balance, idx) => balance ? [[tokenAccountsWithMints[idx][0], balance]] : [])

  const tokenBalances = [...solTokenBalances, ...splTokenBalances].reduce((acc, [mint, value]) => {
    return (value ?? 0n) > 0n
      ? {
        ...acc,
        [mint]: (acc[mint] ?? 0n) + value
      }
      : acc
  }, {});

  return transformBalances({ tokenBalances });
}

async function getTokenAccountBalances(
  tokenAccountAddresses
) {
  const data = await getMultipleAccountsBatched(
    tokenAccountAddresses,
    // get _just_ the account balance
    { length: 64, offset: 64 }
  );

  return data
    .map(value => value ? BigInt(value.data.parsed.info.tokenAmount.amount) : null)
}

async function getSolBalances(
  owners
) {
  const data = await getMultipleAccountsBatched(
    owners,
  );

  return data.map(value => value ? BigInt(value.lamports) : null);
}

function getAssociatedTokenAccountAddress(
  owner,
  token
) {
  return PublicKey.findProgramAddressSync(
    [
      new PublicKey(owner).toBuffer(),
      TOKEN_PROGRAM_ID_BUFFER,
      new PublicKey(token).toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0].toBase58();
}

async function getMultipleAccountsBatched(
  addresses,
  dataSlice
) {
  // this lets us query for 100 * 50 * 1 (5000k) accounts at a time 
  const rpcMethodChunks = sliceIntoChunks(addresses, 100);
  const httpRequestChunks = sliceIntoChunks(rpcMethodChunks, 25);
  const promiseChunks = sliceIntoChunks(httpRequestChunks, 1);

  const data = [];
  for (const promiseChunk of promiseChunks) {
    const result = (
      await Promise.all(
        promiseChunk.map(httpRequestChunk =>
          solanaRpcRetry({
            body: httpRequestChunk.map(rpcMethodChunk => ({
              jsonrpc: "2.0",
              id: 1,
              method: "getMultipleAccounts",
              params: [rpcMethodChunk, {
                dataSlice,
                encoding: "jsonParsed"
              }],
            }))
          })
        )
      )).flat();

    result
      .forEach(item => data.push(...item.result.value))

    await sleep(500);
  }

  return data;
}

async function solanaRpcRetry(
  {
    body,
    maxRetries = 7,
    retryCount = 0,
  }
) {
  try {
    const response = await axios.post(endpoint, body);
    return response.data;
  } catch (err) {
    if (err?.response?.status === 429 && retryCount < maxRetries) {
      log(`Hit Solana RPC rate limit. Retrying...`);
      await sleep((2 ** retryCount) * 1000);
      return solanaRpcRetry({ body, maxRetries, retryCount: retryCount + 1 });
    }

    throw err;
  }
}

module.exports = {
  sumTokens2Batched
}
