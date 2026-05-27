const ADDRESSES = require("../helper/coreAssets.json");
const { getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const TRUBILL_VAULT_PROGRAM_ID = new PublicKey("4EXXZCu2BR4RZ4RCFYUqk6s4SLVpr6umrzw8mqGMwVR4");
const USDC_MINT = new PublicKey(ADDRESSES.solana.USDC);
const ULTRA_MINT = new PublicKey("9DRPPWYud8i6CaSsDsFESs1xyVr8dBCMtjPZji2xiZEa");

const DELTA_MANAGER_PROGRAM_ID = new PublicKey("GtraRX3S3xsLHU6VpzGFxaqVmKjbEkFxyMmwZoKwQJrS");
const ASSET_CONTROLLER = new PublicKey("FQ9X5cF6oWmGcH6XAsdkPwBj2mKWRoTXU2zGS1gCgBaJ");

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

const SCALE_FACTOR = 1_000_000n;

const EPOCH_RATE_LOOKBACK = 5n;

async function getLatestEpochRateInfo(connection, currentEpoch) {
  const firstEpoch =
    currentEpoch > EPOCH_RATE_LOOKBACK ? currentEpoch - EPOCH_RATE_LOOKBACK : 0n;

  const epochs = [];
  for (let epoch = currentEpoch - 1n; epoch >= firstEpoch; epoch -= 1n) {
    epochs.push(epoch);
  }

  const accounts = await connection.getMultipleAccountsInfo(
    epochs.map(deriveEpochExchangeRatePda)
  );

  const index = accounts.findIndex(Boolean);
  if (index === -1) {
    throw new Error(`No epoch_rate account found in the last ${EPOCH_RATE_LOOKBACK} epochs`);
  }

  return {
    epoch: epochs[index],
    accountInfo: accounts[index],
  };
}

const vaultAuthority = PublicKey.findProgramAddressSync(
  [Buffer.from("vault_authority")],
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

function deriveEpochExchangeRatePda(epoch) {
  const epochBuf = Buffer.alloc(8);
  epochBuf.writeBigUInt64LE(epoch);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("epoch_rate"), ASSET_CONTROLLER.toBuffer(), epochBuf],
    DELTA_MANAGER_PROGRAM_ID,
  )[0];
}

function readTokenAccountAmount(accountInfo) {
  return accountInfo.data.readBigUInt64LE(64);
}

// UsdcAccounting:    reserve(8) pending_deposits(8) sent_for_minting(8) owed_to_users(8) ...
// UltraAccounting:   total_settled(8) pending_redemptions(8) pending_redemptions_for_reserve(8)
//                    sent_for_redemption(8) sent_for_reserve(8) ...
// AssetController:   discriminator(8) + u64(8) + 9*Pubkey(288) + u64(8) before current_epoch.
// EpochExchangeRate: asset_controller(32) epoch(8) rate(8) — `rate` is NAV scaled by SCALE_FACTOR.

function decodeUsdcAccounting(data) {
  return {
    sentForMinting: data.readBigUInt64LE(24),
    owedToUsers: data.readBigUInt64LE(32),
  };
}

function decodeUltraAccounting(data) {
  return {
    pendingRedemptions: data.readBigUInt64LE(16),
    sentForReserve: data.readBigUInt64LE(40),
  };
}

function decodeCurrentEpoch(data) {
  return data.readBigUInt64LE(312);
}

function decodeNav(data) {
  return data.readBigUInt64LE(48);
}

async function trubillTvl(api) {
  const connection = getConnection();

  const assetControllerInfo = await connection.getAccountInfo(ASSET_CONTROLLER);
  const currentEpoch = decodeCurrentEpoch(assetControllerInfo.data);
  const { accountInfo: epochRateInfo } = await getLatestEpochRateInfo(connection, currentEpoch);

  const [usdcAtaInfo, ultraAtaInfo, usdcAcctInfo, ultraAcctInfo] =
    await connection.getMultipleAccountsInfo([
      vaultUsdcAta,
      vaultUltraAta,
      usdcAccountingPda,
      ultraAccountingPda,
    ]);

  const usdcHeld = readTokenAccountAmount(usdcAtaInfo);
  const ultraHeld = readTokenAccountAmount(ultraAtaInfo);
  const { sentForMinting, owedToUsers } = decodeUsdcAccounting(usdcAcctInfo.data);
  const { pendingRedemptions, sentForReserve } = decodeUltraAccounting(ultraAcctInfo.data);
  const nav = decodeNav(epochRateInfo.data);

  const effectiveUltra = ultraHeld + sentForReserve - pendingRedemptions;
  const ultraValue = (nav * effectiveUltra) / SCALE_FACTOR;
  const totalAssets = ultraValue + usdcHeld + sentForMinting - owedToUsers;
  api.add(USDC_MINT.toString(), totalAssets.toString());
}

module.exports = {
  methodology: "Counts the TVL of the TruBill vault.",
  solana: { tvl: trubillTvl },
};
