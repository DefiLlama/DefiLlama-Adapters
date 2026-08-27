const { getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const PROGRAM_ID = new PublicKey(
  "9RY54dNPYTzDyh3TfFqDdt2b2KMM56KW1tw9erRTGQo6"
);

const PASTA_MINT =
  "39kMeX4HVRW9qbbiHSPbRQ9xeXUF18GrNP6gL61Ppump";

const LOCK_DATA_SIZE = 105;

const LOCK_DISCRIMINATOR = Buffer.from([
  8, 255, 36, 202, 210, 22, 57, 137
]);

function decodeLock(data) {
  if (!data.slice(0, 8).equals(LOCK_DISCRIMINATOR)) return null;

  return {
    mint: new PublicKey(data.slice(40, 72)).toBase58(),
    amount: data.readBigUInt64LE(72),
    unlockAt: Number(data.readBigInt64LE(88)),
  };
}

async function getActiveLocks() {
  const connection = getConnection();

  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      { dataSize: LOCK_DATA_SIZE },
      {
        memcmp: {
          offset: 0,
          bytes: LOCK_DISCRIMINATOR.toString("base64"),
          encoding: "base64",
        },
      },
    ],
  });

  const now = Math.floor(Date.now() / 1000);

  return accounts
    .map(({ account }) => decodeLock(account.data))
    .filter(Boolean)
    .filter((lock) => lock.unlockAt > now);
}

async function tvl(api) {
  const locks = await getActiveLocks();

  for (const lock of locks) {
    if (lock.mint === PASTA_MINT) continue;
    api.add(lock.mint, lock.amount.toString());
  }
}

async function staking(api) {
  const locks = await getActiveLocks();

  for (const lock of locks) {
    if (lock.mint !== PASTA_MINT) continue;
    api.add(lock.mint, lock.amount.toString());
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the value of circulating Token-2022 assets deposited by users into active DevFridge program-controlled timelock vaults on Solana. Only locks whose unlock_at timestamp is still in the future are counted. DevFridge's own PASTA token is reported separately under staking.",
  solana: {
    tvl,
    staking,
  },
};
