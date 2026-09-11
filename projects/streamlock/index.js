const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

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
//   total          409 bytes
const POOL_CONFIG_SIZE = 409;
const SOL_VAULT_OFFSET = 40;

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

  for (const { account } of poolConfigs) {
    const data = asBuffer(account.data);
    const solVault = new PublicKey(
      data.subarray(SOL_VAULT_OFFSET, SOL_VAULT_OFFSET + 32)
    );

    solVaults.push(solVault.toBase58());
  }

  // Native SOL and LST (jitoSOL) sitting in each pool's bonding-curve vault
  if (solVaults.length) {
    await sumTokens2({ api, owners: solVaults, solOwners: solVaults });
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL sums native SOL and jitoSOL held in per-token bonding-curve sol_vault PDAs (discovered via getProgramAccounts on the Streamlock Token Factory, filtered by the 409-byte PoolConfig account size).",
  solana: { tvl },
};