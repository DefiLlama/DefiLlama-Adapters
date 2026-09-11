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

let _locks;
async function getActiveLocks() {
  if (!_locks) _locks = _getActiveLocks();
  return _locks;
}

async function _getActiveLocks() {
  const connection = getConnection();

  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    // discriminator is checked in decodeLock — the base64 memcmp filter is
    // silently ignored/mismatched by some RPCs and returns zero accounts
    filters: [{ dataSize: LOCK_DATA_SIZE }],
  });

  const now = Math.floor(Date.now() / 1000);

  return accounts
    .map(({ account }) => decodeLock(account.data))
    .filter(Boolean)
    .filter((lock) => lock.unlockAt > now);
}

async function vesting(api) {
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
    "DevFridge is a token locker: user-locked Token-2022 assets in active program-controlled timelock vaults on Solana are counted as vesting. DevFridge's own PASTA token is reported separately under staking. TVL is zero by design.",
  solana: {
    tvl: () => ({}),
    vesting,
    staking,
  },
};
