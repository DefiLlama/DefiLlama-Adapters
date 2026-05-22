const ADDRESSES = require("../helper/coreAssets.json");
const { getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

// TruFin TruBill — Solana vault that accepts USDC, mints TruBILL shares, and routes a
// configurable portion of deposits into ULTRA (Libeara's tokenized US T-bill) via Delta Manager.
const TRUBILL_VAULT_PROGRAM_ID = new PublicKey("4EXXZCu2BR4RZ4RCFYUqk6s4SLVpr6umrzw8mqGMwVR4");
const USDC_MINT = new PublicKey(ADDRESSES.solana.USDC);
const ULTRA_MINT = new PublicKey("9DRPPWYud8i6CaSsDsFESs1xyVr8dBCMtjPZji2xiZEa");
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

const SCALE_FACTOR = 1_000_000n;

const vaultAuthority = PublicKey.findProgramAddressSync(
  [Buffer.from("vault_authority")],
  TRUBILL_VAULT_PROGRAM_ID,
)[0];
const vaultConfigPda = PublicKey.findProgramAddressSync(
  [Buffer.from("vault_config")],
  TRUBILL_VAULT_PROGRAM_ID,
)[0];
const usdcAccountingPda = PublicKey.findProgramAddressSync(
  [Buffer.from("usdc_accounting")],
  TRUBILL_VAULT_PROGRAM_ID,
)[0];
const ultraAccountingPda = PublicKey.findProgramAddressSync(
  [Buffer.from("ultra_accounting")],
  TRUBILL_VAULT_PROGRAM_ID,
)[0];

function deriveAta(mint, tokenProgram) {
  return PublicKey.findProgramAddressSync(
    [vaultAuthority.toBuffer(), tokenProgram.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

const vaultUsdcAta = deriveAta(USDC_MINT, TOKEN_PROGRAM_ID);
const vaultUltraAta = deriveAta(ULTRA_MINT, TOKEN_2022_PROGRAM_ID);

function deriveEpochSnapshotPda(epoch) {
  const epochBuf = Buffer.alloc(8);
  epochBuf.writeBigUInt64LE(epoch);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("epoch_snapshot"), epochBuf],
    TRUBILL_VAULT_PROGRAM_ID,
  )[0];
}

// SPL Token / Token-2022 token account amount lives at offset 64.
function readTokenAccountAmount(accountInfo) {
  if (!accountInfo) return 0n;
  return accountInfo.data.readBigUInt64LE(64);
}

// All structs below are Anchor accounts: 8-byte discriminator + Borsh-packed (no padding) body.

// VaultConfig: vault_authority_bump(1) is_paused(1) min_deposit_amount(8) instant_redeem_fee(2)
//              treasury(32) last_snapshot_epoch(8) ...
function decodeLastSnapshotEpoch(data) {
  return data.readBigUInt64LE(52);
}

// EpochSnapshot: epoch(8) nav(8) ultra_held(8) usdc_held(8) ...
function decodeSnapshotNav(data) {
  return data.readBigUInt64LE(16);
}

// UsdcAccounting: reserve(8) pending_deposits(8) sent_for_minting(8) owed_to_users(8) ...
function decodeUsdcAccounting(data) {
  return {
    sentForMinting: data.readBigUInt64LE(24),
    owedToUsers: data.readBigUInt64LE(32),
  };
}

// UltraAccounting: total_settled(8) pending_redemptions(8) pending_redemptions_for_reserve(8)
//                  sent_for_redemption(8) sent_for_reserve(8) ...
function decodeUltraAccounting(data) {
  return {
    pendingRedemptions: data.readBigUInt64LE(16),
    sentForReserve: data.readBigUInt64LE(40),
  };
}

async function trubillTvl(api) {
  const connection = getConnection();

  // Step 1: find the latest snapshot epoch to source NAV from.
  const vaultConfigInfo = await connection.getAccountInfo(vaultConfigPda);
  if (!vaultConfigInfo) return;

  const lastSnapshotEpoch = decodeLastSnapshotEpoch(vaultConfigInfo.data);
  // `last_snapshot_epoch` defaults to u64::MAX until the first `update_total_assets` runs.
  // No snapshot means no ULTRA has been minted yet, so TVL is at most the raw USDC balance.
  const hasSnapshot = lastSnapshotEpoch !== 0xFFFFFFFFFFFFFFFFn;

  // Step 2: batch-fetch all accounts needed for the live total_assets formula.
  const accountsToFetch = [
    vaultUsdcAta,
    vaultUltraAta,
    usdcAccountingPda,
    ultraAccountingPda,
  ];
  if (hasSnapshot) accountsToFetch.push(deriveEpochSnapshotPda(lastSnapshotEpoch));

  const [usdcAtaInfo, ultraAtaInfo, usdcAcctInfo, ultraAcctInfo, snapshotInfo] =
    await connection.getMultipleAccountsInfo(accountsToFetch);

  const usdcHeld = readTokenAccountAmount(usdcAtaInfo);
  const ultraHeld = readTokenAccountAmount(ultraAtaInfo);
  const { sentForMinting, owedToUsers } = usdcAcctInfo
    ? decodeUsdcAccounting(usdcAcctInfo.data)
    : { sentForMinting: 0n, owedToUsers: 0n };
  const { pendingRedemptions, sentForReserve } = ultraAcctInfo
    ? decodeUltraAccounting(ultraAcctInfo.data)
    : { pendingRedemptions: 0n, sentForReserve: 0n };
  const nav = hasSnapshot && snapshotInfo ? decodeSnapshotNav(snapshotInfo.data) : SCALE_FACTOR;

  // Step 3: apply the same formula the program uses in `update_total_assets`.
  //   effective_ultra = ultra_held + sent_for_reserve - pending_redemptions
  //   ultra_value     = nav * effective_ultra / SCALE_FACTOR
  //   total_assets    = ultra_value + usdc_held + sent_for_minting - owed_to_users
  const effectiveUltra = ultraHeld + sentForReserve - pendingRedemptions;
  const ultraValue = (nav * effectiveUltra) / SCALE_FACTOR;
  const totalAssets = ultraValue + usdcHeld + sentForMinting - owedToUsers;

  api.add(USDC_MINT.toString(), totalAssets.toString());
}

module.exports = {
  methodology:"Counts the TVL of the TruBill vault.",
  solana: { tvl: trubillTvl },
};
