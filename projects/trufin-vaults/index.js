const { getConnection, decodeAccount, getAssociatedTokenAddress } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const { tickToPrice } = require("../helper/utils/tick");

const VAULT_PROGRAM_ID = new PublicKey("5CjtbqE3tE6LDnPU1HKyvnzPsNVkyxF4H6tPRUrTQDX3");
const RAYDIUM_CLMM_PROGRAM_ID = new PublicKey("CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK");
const WSOL_MINT = "So11111111111111111111111111111111111111112";
const TRUSOL_MINT = "6umRHtiuBd1PC6HQhfH9ioNsqY4ihZncZXNPiGu3d3rN";
const TRUSOL_STAKE_POOL = new PublicKey("EyKyx9LKz7Qbp6PSbBRoMdt8iNYp8PvFVupQTQRMY9AM");

const vaultStatePda = PublicKey.findProgramAddressSync([Buffer.from("vault_state")], VAULT_PROGRAM_ID)[0];
const vaultSolPda = PublicKey.findProgramAddressSync([Buffer.from("vault_sol")], VAULT_PROGRAM_ID)[0];
const vaultWsolAta = getAssociatedTokenAddress(WSOL_MINT, vaultSolPda.toString());
const vaultTrusolAta = getAssociatedTokenAddress(TRUSOL_MINT, vaultSolPda.toString());

// VaultState Borsh layout offsets (after 8-byte Anchor discriminator):
// [8]  vault_sol_bump: u8
// [9]  current_position_tick_lower: i32
// [13] current_position_tick_upper: i32
// [17] fee: u64
// [25] treasury_trusol_fees: u64
// [33] treasury_wsol_fees: u64
// [41] treasury: Pubkey (32)
// [73] is_paused: bool
// [74] raydium_pool_address: Pubkey (32)
function decodeVaultState(data) {
  const tickLower = data.readInt32LE(9);
  const tickUpper = data.readInt32LE(13);
  const poolAddress = new PublicKey(data.slice(74, 106));
  return { tickLower, tickUpper, poolAddress };
}

function derivePositionNftMint(tickLower, tickUpper) {
  const tickLowerBuf = Buffer.alloc(4);
  tickLowerBuf.writeInt32LE(tickLower);
  const tickUpperBuf = Buffer.alloc(4);
  tickUpperBuf.writeInt32LE(tickUpper);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("position_nft_mint"), vaultStatePda.toBuffer(), tickLowerBuf, tickUpperBuf],
    VAULT_PROGRAM_ID,
  )[0];
}

function derivePersonalPosition(nftMint) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("position"), nftMint.toBuffer()],
    RAYDIUM_CLMM_PROGRAM_ID,
  )[0];
}

function readTokenAccountAmount(accountInfo) {
  if (!accountInfo) return 0;
  return Number(accountInfo.data.readBigUInt64LE(64));
}

function getPositionAmounts(tickLower, tickUpper, tickCurrent, liquidity) {
  const sa = tickToPrice(tickLower / 2);
  const sb = tickToPrice(tickUpper / 2);

  let amount0 = 0;
  let amount1 = 0;

  if (tickCurrent < tickLower) {
    amount0 = liquidity * (sb - sa) / (sa * sb);
  } else if (tickCurrent < tickUpper) {
    const sp = tickToPrice(tickCurrent) ** 0.5;
    amount0 = liquidity * (sb - sp) / (sp * sb);
    amount1 = liquidity * (sp - sa);
  } else {
    amount1 = liquidity * (sb - sa);
  }

  return { amount0: Math.floor(amount0), amount1: Math.floor(amount1) };
}

async function raydiumVaultTvl() {
  const connection = getConnection();

  const vaultStateAccount = await connection.getAccountInfo(vaultStatePda);
  const { tickLower, tickUpper, poolAddress } = decodeVaultState(vaultStateAccount.data);

  const nftMint = derivePositionNftMint(tickLower, tickUpper);
  const personalPositionPda = derivePersonalPosition(nftMint);

  const [solBalance, wsolAccount, trusolAccount, positionAccount, poolAccount, stakePoolAccount] =
    await Promise.all([
      connection.getBalance(vaultSolPda),
      connection.getAccountInfo(new PublicKey(vaultWsolAta)),
      connection.getAccountInfo(new PublicKey(vaultTrusolAta)),
      connection.getAccountInfo(personalPositionPda),
      connection.getAccountInfo(poolAddress),
      connection.getAccountInfo(TRUSOL_STAKE_POOL),
    ]);

  const wsolBalance = readTokenAccountAmount(wsolAccount);
  const trusolBalance = readTokenAccountAmount(trusolAccount);

  const stakePoolTotalLamports = Number(stakePoolAccount.data.readBigUInt64LE(258));
  const stakePoolTokenSupply = Number(stakePoolAccount.data.readBigUInt64LE(266));
  const trusolPrice = stakePoolTotalLamports / stakePoolTokenSupply;

  const position = decodeAccount("raydiumPositionInfo", positionAccount);
  const pool = decodeAccount("raydiumCLMM", poolAccount);

  const { amount0, amount1 } = getPositionAmounts(
    position.tickLower, position.tickUpper, pool.tickCurrent,
    Number(position.liquidity.toString()),
  );

  const positionWsol = amount0 + Number(position.tokenFeesOwedA.toString());
  const positionTrusol = amount1 + Number(position.tokenFeesOwedB.toString());

  const totalSol = solBalance + wsolBalance + positionWsol
    + (trusolBalance + positionTrusol) * trusolPrice;

  return { solana: totalSol / 1e9 };
}

module.exports = {
  methodology: "Counts the TVL of the TruFin Raydium Vault.",
  solana: { tvl: raydiumVaultTvl },
};
