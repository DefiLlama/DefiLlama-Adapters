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

const WSOL = "So11111111111111111111111111111111111111112";
const PUMP_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");
// Pump.fun curves quoted in SOL start at 30 SOL of virtual reserves and graduate near 115 SOL.
const MAX_SOL_CURVE_VIRTUAL_LAMPORTS = 300n * 1000000000n;

// Spot SOL value (amount x curve price) of tokens on a pump.fun bonding curve, matching DefiLlama's price x balance method.
// Used because DefiLlama has no price for tokens that have not graduated to a DEX.
function bondingCurveSolValue(curveData, amount) {
  const vToken = curveData.readBigUInt64LE(8);
  const vSol = curveData.readBigUInt64LE(16);
  const complete = curveData[48] === 1;
  if (complete || vToken === 0n || vSol === 0n || vSol > MAX_SOL_CURVE_VIRTUAL_LAMPORTS) return null;
  return (vSol * amount) / vToken;
}

async function vesting(api) {
  const balances = await getVaultBalances();
  const mints = Object.keys(balances).filter((m) => m !== PASTA_MINT && balances[m] > 0n);
  const curves = mints.map(
    (m) => PublicKey.findProgramAddressSync([Buffer.from("bonding-curve"), new PublicKey(m).toBuffer()], PUMP_PROGRAM)[0]
  );
  const infos = await getConnection().getMultipleAccountsInfo(curves);

  mints.forEach((mint, i) => {
    const info = infos[i];
    const sol = info && info.data.length >= 49 ? bondingCurveSolValue(info.data, balances[mint]) : null;
    if (sol === null) {
      // graduated / non-pump token: let DefiLlama price the mint itself (unpriced mints are dropped, never invented)
      api.add(mint, balances[mint].toString());
    } else if (sol > 0n) {
      api.add(WSOL, sol.toString());
    }
  });
}

// PASTA graduated to PumpSwap; DefiLlama does not price it, so value it at the pool's spot SOL price.
const PASTA_POOL = new PublicKey("5o5JBdWZd3zKE3JC8Tb81D3bph7bwxftvwLLRoZ1EqL5");
const MIN_POOL_SOL_LAMPORTS = 5n * 1000000000n; // reject thin / drained pools

async function pastaSolValue(amount) {
  const connection = getConnection();
  const pool = await connection.getAccountInfo(PASTA_POOL);
  if (!pool || pool.data.length < 203) return null;
  const baseMint = new PublicKey(pool.data.slice(43, 75)).toBase58();
  const quoteMint = new PublicKey(pool.data.slice(75, 107)).toBase58();
  if (baseMint !== PASTA_MINT || quoteMint !== WSOL) return null;
  const [baseVault, quoteVault] = await connection.getMultipleAccountsInfo([
    new PublicKey(pool.data.slice(139, 171)),
    new PublicKey(pool.data.slice(171, 203)),
  ]);
  if (!baseVault || !quoteVault) return null;
  const baseReserve = BigInt(decodeAccount("tokenAccount", baseVault).amount.toString());
  const quoteReserve = BigInt(decodeAccount("tokenAccount", quoteVault).amount.toString());
  if (baseReserve === 0n || quoteReserve < MIN_POOL_SOL_LAMPORTS) return null;
  return (quoteReserve * amount) / baseReserve;
}

async function staking(api) {
  const balances = await getVaultBalances();
  const amount = balances[PASTA_MINT];
  if (!amount) return;
  const sol = await pastaSolValue(amount);
  if (sol === null) api.add(PASTA_MINT, amount.toString()); // no reliable pool: leave unvalued
  else api.add(WSOL, sol.toString());
}

module.exports = {
  timetravel: false,
  methodology:
    "DevFridge is a token locker: user-locked Token-2022 assets in active program-controlled timelock vaults on Solana are counted as vesting, using real vault balances. Only locks whose unlock_at timestamp is still in the future are counted. Tokens still on a pump.fun SOL bonding curve are valued on-chain at the curve's spot SOL price; graduated tokens are priced by DefiLlama. DevFridge's own PASTA token is reported separately under staking.",
  solana: {
    tvl: () => ({}),
    vesting,
    staking,
  },
};
