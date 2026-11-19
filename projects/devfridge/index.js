const { getConnection, decodeAccount } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const PROGRAM_ID = new PublicKey(
  "9RY54dNPYTzDyh3TfFqDdt2b2KMM56KW1tw9erRTGQo6"
);

const PASTA_MINT =
  "39kMeX4HVRW9qbbiHSPbRQ9xeXUF18GrNP6gL61Ppump";

const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

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

// Vault = Token-2022 ATA owned by the lock PDA (see CreateLock in the program).
function vaultAddress(lockPubkey, mint) {
  return PublicKey.findProgramAddressSync(
    [lockPubkey.toBuffer(), TOKEN_2022_PROGRAM_ID.toBuffer(), new PublicKey(mint).toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}

// Returns { [mint]: bigint } using real vault balances of active locks.
let cache;
async function getVaultBalances() {
  if (cache) return cache;
  cache = (async () => {
    const connection = getConnection();
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [{ dataSize: LOCK_DATA_SIZE }],
    });

    const now = Math.floor(Date.now() / 1000);
    const locks = accounts
      .map(({ pubkey, account }) => ({ pubkey, lock: decodeLock(account.data) }))
      .filter(({ lock }) => lock && lock.unlockAt > now);

    const vaults = locks.map(({ pubkey, lock }) => vaultAddress(pubkey, lock.mint));
    const balances = {};
    for (let i = 0; i < vaults.length; i += 99) {
      const infos = await connection.getMultipleAccountsInfo(vaults.slice(i, i + 99));
      infos.forEach((info, k) => {
        if (!info) return; // vault closed/missing: nothing to count
        const decoded = decodeAccount("tokenAccount", info);
        const mint = decoded.mint.toString();
        // the lock's mint must match the vault mint, each vault is unique per lock
        if (mint !== locks[i + k].lock.mint) return;
        balances[mint] = (balances[mint] || 0n) + BigInt(decoded.amount.toString());
      });
    }
    return balances;
  })();
  return cache;
}

async function vesting(api) {
  const balances = await getVaultBalances();
  for (const [mint, amount] of Object.entries(balances)) {
    if (mint === PASTA_MINT) continue;
    api.add(mint, amount.toString());
  }
}

async function staking(api) {
  const balances = await getVaultBalances();
  if (balances[PASTA_MINT]) api.add(PASTA_MINT, balances[PASTA_MINT].toString());
}

module.exports = {
  timetravel: false,
  methodology:
    "DevFridge is a token locker: user-locked Token-2022 assets in active program-controlled timelock vaults on Solana are counted as vesting, using real vault balances. Only locks whose unlock_at timestamp is still in the future are counted. DevFridge's own PASTA token is reported separately under staking. TVL is zero by design.",
  solana: {
    tvl: () => ({}),
    vesting,
    staking,
  },
};
