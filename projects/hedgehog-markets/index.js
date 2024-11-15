// @ts-check

const base58 = require("bs58");
const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");
const { sliceIntoChunks } = require("../helper/utils");

const owners = [
  // P2P (LULO).
  "J9EH18EWSo8s69gouHGNy5zFHkhcHRbb9zBZXwSG4cHy",
  // Parimutuel.
  "3SAUPiGiATqv8TBgvzSJqpLxLGF6LbJamvimueJQT7WT",
  // Parlay.
  "8Y46GkrbUqXnbs6kPD6SWr44NjcKPEWYzvpAn8UB5duR",
];

const classicMarketsId = "D8vMVKonxkbBtAXAxBwPPWyTfon8337ARJmHvwtsF98G";
const p2pId = "P2PototC41acvjMc9cvAoRjFjtaRD5Keo9PvNJfRwf3";
const p2pLuloId = "P2PzLraW8YF87BxqZTZ5kgrfvzcrKGPnqUBNhqmcV9B";
const parimutuelId = "PARrVs6F5egaNuz8g6pKJyU4ze3eX5xGZCFb3GLiVvu";
const parlayId = "PLYaNRbQs9GWyVQdcLrzPvvZu7NH4W2sneyHcEimLr7";

const tokenProgramId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

/** @typedef {import("@defillama/sdk").ChainApi} ChainApi */
/** @typedef {import("@solana/web3.js").Connection} Connection */
/** @typedef {{ [mint: string]: string | number }} Balances */

/**
 * @param {ChainApi} api
 * @param {import("@solana/web3.js").AccountInfo<Buffer>} account
 */
function addTokenAccountBalance(api, account) {
  const { data } = account;

  // Mint address is at offset 0.
  const mint = base58.encode(data.subarray(0, 32));
  // Amount if a u64 at offset 64.
  const amount = data.readBigUint64LE(64);

  api.add(mint, amount);
}

/**
 * @param {ChainApi} api
 * @param {Connection} connection
 * @param {Array<PublicKey>} tokenAccounts
 */
async function addTokenAccountBalances(api, connection, tokenAccounts) {
  api.log(`fetching ${tokenAccounts.length} token account balances`);

  /** @type {Array<Array<PublicKey>>} */
  const chunks = sliceIntoChunks(tokenAccounts, 100);

  for (const chunk of chunks) {
    const accounts = await connection.getMultipleAccountsInfo(chunk);

    for (const account of accounts) {
      if (account === null) {
        continue;
      }
      addTokenAccountBalance(api, account);
    }
  }
}

/**
 * @param {ChainApi} api
 * @param {Connection} connection
 * @param {Array<PublicKey>} owners
 */
async function addOwnerBalances(api, connection, owners) {
  api.log(`fetching token balances for ${owners.length} owners`);

  if (owners.length === 0) {
    return;
  }

  const programId = new PublicKey(tokenProgramId);

  for (const owner of owners) {
    const result = await connection.getTokenAccountsByOwner(owner, {
      programId,
    });

    api.log(`fetched ${result.value.length} token balances for owner`);

    for (const { account } of result.value) {
      addTokenAccountBalance(api, account);
    }
  }
}

/**
 * @param {ChainApi} api
 * @param {Connection} connection
 * @param {Array<PublicKey>} tokenAccounts
 */
async function getClassicMarketsTokenAccounts(api, connection, tokenAccounts) {
  const programId = new PublicKey(classicMarketsId);

  const result = await connection.getProgramAccounts(programId, {
    encoding: "base64",
    // We only care about market collateral address (136..168).
    dataSlice: { offset: 136, length: 32 },
    filters: [
      // Market accounts have a discriminator of [219, 190, 213, 55, 0, 227, 198, 154] at offset 0.
      { memcmp: { offset: 0, bytes: "dkokXHR3DTw" } },
    ],
  });

  api.log(`classic markets: ${result.length}`);

  for (const { account } of result) {
    const { data } = account;

    // Market collateral address is at offset 136 + 0.
    const collateral = new PublicKey(data);

    tokenAccounts.push(collateral);
  }
}

/**
 * @param {ChainApi} api
 * @param {Connection} connection
 * @param {Array<PublicKey>} tokenAccounts
 */
async function addP2PDeposits(api, connection, tokenAccounts) {
  const programId = new PublicKey(p2pId);

  const result = await connection.getProgramAccounts(programId, {
    encoding: "base64",
    // We only care about the market addresses.
    dataSlice: { offset: 0, length: 0 },
    filters: [
      // Market accounts have a discriminator of 3 at offset 0.
      { memcmp: { offset: 0, bytes: "4" } },
    ],
  });

  api.log(`p2p (no-lulo) markets: ${result.length}`);

  for (const { pubkey } of result) {
    // Market deposit account.
    const [deposit] = PublicKey.findProgramAddressSync(
      [Buffer.from("deposit"), pubkey.toBuffer()],
      programId,
    );

    tokenAccounts.push(deposit);
  }
}

/**
 * @param {ChainApi} api
 * @param {Connection} connection
 */
async function addP2PLuloDeposits(api, connection) {
  const programId = new PublicKey(p2pLuloId);

  const result = await connection.getProgramAccounts(programId, {
    encoding: "base64",
    // We only care about:
    // - mint address (73..105)
    // - yes amount (113..121)
    // - no amount (121..129)
    dataSlice: { offset: 73, length: 56 },
    filters: [
      // Market accounts have a discriminator of 3 at offset 0.
      { memcmp: { offset: 0, bytes: "4" } },
      // Open markets have a state of 0 at offset 129.
      { memcmp: { offset: 129, bytes: "1" } },
    ],
  });

  api.log(`p2p (lulo) markets: ${result.length}`);

  for (const { account } of result) {
    const { data } = account;

    // Mint address is at offset 73 + 0.
    const mint = base58.encode(data.subarray(0, 32));
    // Yes amounts is a u64 at offset 73 + 40.
    const yesAmount = data.readBigUint64LE(40);
    // No amounts is a u64 at offset 73 + 48.
    const noAmount = data.readBigUInt64LE(48);

    api.add(mint, yesAmount + noAmount);
  }
}

/**
 * @param {ChainApi} api
 * @param {Connection} connection
 */
async function addParimutuelDeposits(api, connection) {
  const programId = new PublicKey(parimutuelId);

  const result = await connection.getProgramAccounts(programId, {
    encoding: "base64",
    filters: [
      // Market accounts have a discriminator of 3 at offset 0.
      { memcmp: { offset: 0, bytes: "4" } },
      // Open markets have a state of 0 at offset 129.
      { memcmp: { offset: 129, bytes: "1" } },
    ],
  });

  api.log(`parimutuel markets: ${result.length}`);

  for (const { account } of result) {
    const { data } = account;

    // Mint address is at offset 69.
    const mint = base58.encode(data.subarray(69, 69 + 32));

    // Amounts is a u64 array with u8 length prefix at offset 131.
    const amountsLen = data.readUint8(131);

    let sumAmounts = 0n;
    for (let i = 0; i < amountsLen; i++) {
      sumAmounts += data.readBigUint64LE(132 + i * 8);
    }

    api.add(mint, sumAmounts);
  }
}

/**
 * @param {ChainApi} api
 * @param {Connection} connection
 */
async function addParlayDeposits(api, connection) {
  const programId = new PublicKey(parlayId);

  const result = await connection.getProgramAccounts(programId, {
    encoding: "base64",
    // We only care about:
    // - mint address (69..101)
    // - entry count (101..105)
    // - entry cost (105..113)
    dataSlice: { offset: 69, length: 44 },
    filters: [
      // Market accounts have a discriminator of 3 at offset 0.
      { memcmp: { offset: 0, bytes: "4" } },
      // Open markets have a state of 0 at offset 149.
      { memcmp: { offset: 149, bytes: "1" } },
    ],
  });

  api.log(`parlay markets: ${result.length}`);

  for (const { account } of result) {
    const { data } = account;

    // Mint address is at offset 69 + 0.
    const mint = base58.encode(data.subarray(0, 32));
    // Entry count is a u32 at offset 69 + 32.
    const entryCount = data.readUint32LE(32);
    // Entry cost is a u64 at offset 69 + 36.
    const entryCost = data.readBigUint64LE(36);

    api.add(mint, BigInt(entryCount) * entryCost);
  }
}

/**
 * @param {import("@defillama/sdk").ChainApi} api
 */
async function tvl(api) {
  /** @type {import("@solana/web3.js").Connection} */
  const connection = getConnection();

  /** @type {Array<PublicKey>} */
  const tokenAccounts = [];

  await getClassicMarketsTokenAccounts(api, connection, tokenAccounts);

  await addP2PDeposits(api, connection, tokenAccounts);

  await addP2PLuloDeposits(api, connection);
  await addParimutuelDeposits(api, connection);
  await addParlayDeposits(api, connection);

  await addOwnerBalances(api, connection, owners.map((k) => new PublicKey(k)));
  await addTokenAccountBalances(api, connection, tokenAccounts);

  return api.getBalances();
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  methodology: "TVL consists of deposits made into Hedgehog Markets.",
  hallmarks: [],
};
