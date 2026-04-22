const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const ADDRESSES = require("../helper/coreAssets.json");

// Streamlock Token Factory program — owns every pool_config and sol_vault PDA
// created by the launchpad. https://www.streamlock.fun/
const TOKEN_FACTORY_PROGRAM_ID = new PublicKey(
  "6TviBvKxg8jGhJaKfSKsD8Ph93cxrKFUrkxpi9peTcT5"
);

// Anchor-serialized PoolConfig account:
//   bytes  0..  8  anchor discriminator
//   bytes  8.. 40  token_mint (Pubkey)
//   bytes 40.. 72  sol_vault (Pubkey)              <-- SOL_VAULT_OFFSET
//   ...
//   bytes 316..324 staked_sol_lamports (u64 LE)    <-- STAKED_SOL_OFFSET
//                  (SOL-equivalent of reserves parked in an LST, e.g. JitoSOL)
//   ...
//   total          401 bytes
const POOL_CONFIG_SIZE = 401;
const SOL_VAULT_OFFSET = 40;
const STAKED_SOL_OFFSET = 316;

const SOL_MINT = ADDRESSES.solana.SOL;

// Streamflow escrow token accounts for the three team/treasury $LOCK vesting
// streams. Derived as findProgramAddressSync([b"strm", metadata.toBuffer()],
// strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m).
const STREAMFLOW_LOCK_ESCROWS = [
  "CjzMmFZhhqiZj57SbkXDpBNECfGQFKrpZvfB2PA853A",  // 100M $LOCK (metadata 98WvpTxWoVbraD5AgM2iw4wkRTtqRGfyrxK8AFcfDVqb)
  "DmawVXPrLtJdmH8reXvW9BWw6gtgeVBcn6odn7ALY642", // 70M  $LOCK (metadata ByzmsnUg5iMJfJPoYEMVTvTarvKPwuDyQj3bwtBkPq4W)
  "92pYMtqwS6vLS1VEGQsbLoTikvYhcvK1iYpQa34vd9W3", // 30M  $LOCK (metadata 2iqxMA9nXDBhmuR1BhMenDo4nNvQmRQGsG3WgpDLaSdX)
];

// Some @solana/web3.js versions return account.data as a Buffer; others as
// [base64String, "base64"]. Normalize to Buffer in one place.
function asBuffer(data) {
  if (Buffer.isBuffer(data)) return data;
  if (Array.isArray(data) && typeof data[0] === "string") {
    return Buffer.from(data[0], data[1] || "base64");
  }
  throw new Error("Unexpected account.data shape from getProgramAccounts");
}

async function tvl(api) {
  const connection = getConnection();

  const poolConfigs = await connection.getProgramAccounts(
    TOKEN_FACTORY_PROGRAM_ID,
    { filters: [{ dataSize: POOL_CONFIG_SIZE }] }
  );

  const solVaults = [];
  let totalStakedLamports = 0n;

  for (const { account } of poolConfigs) {
    const data = asBuffer(account.data);
    const solVault = new PublicKey(
      data.subarray(SOL_VAULT_OFFSET, SOL_VAULT_OFFSET + 32)
    );
    const stakedLamports = data.readBigUInt64LE(STAKED_SOL_OFFSET);

    solVaults.push(solVault.toBase58());
    totalStakedLamports += stakedLamports;
  }

  // Native SOL sitting in each pool's bonding-curve vault.
  if (solVaults.length) {
    await sumTokens2({ api, solOwners: solVaults });
  }

  // SOL-equivalent value parked in LSTs (e.g. JitoSOL). Tracked on-chain in
  // pool_config.staked_sol_lamports and denominated in native SOL lamports at
  // stake time (conservative — does not mark-to-market LST yield).
  if (totalStakedLamports > 0n) {
    api.add(SOL_MINT, totalStakedLamports.toString());
  }
}

async function vesting(api) {
  return sumTokens2({ api, tokenAccounts: STREAMFLOW_LOCK_ESCROWS });
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL sums native SOL held in per-token bonding-curve sol_vault PDAs " +
    "(discovered via getProgramAccounts on the Streamlock Token Factory, " +
    "filtered by the 401-byte PoolConfig account size) plus SOL staked as " +
    "JitoSOL (tracked on-chain in each PoolConfig's staked_sol_lamports " +
    "field); this value is unique to Streamlock and does not overlap with " +
    "any other DefiLlama adapter. Vesting tracks $LOCK locked in three " +
    "Streamflow team/treasury contracts and is reported as a separate " +
    "bucket; those streams are also visible to Streamflow's own adapter, " +
    "so the vesting bucket alone is the only overlap with another " +
    "protocol.",
  solana: {
    tvl,
    vesting,
  },
};
