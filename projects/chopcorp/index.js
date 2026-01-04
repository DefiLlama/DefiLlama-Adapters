const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");
const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes");

const CHOPCORP_PROGRAM_ID = new PublicKey("chopmfFa3T1CzZj9WUgq5e18aMvjufSHGfPTvyKkydL");
const SOL_MINT = "So11111111111111111111111111111111111111112";
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const METEORA_LOG_VAULT = new PublicKey("9QMte7M5d2G8tvd91MqBJrgEW2QM3kD9eNNsSneq6y87");
const METEORA_SOL_VAULT = new PublicKey("AyXAMdfQVr7KGJLjCcYYB4rj1xPCknbC4sfBkGjK4gu5");

const DISCRIMINATORS = {
  Automation: Buffer.from([100, 0, 0, 0, 0, 0, 0, 0]),
  PredictionSegmentMarket: Buffer.from([117, 0, 0, 0, 0, 0, 0, 0]),
};

function getTreasuryPDA() {
  return PublicKey.findProgramAddressSync([Buffer.from("treasury")], CHOPCORP_PROGRAM_ID)[0];
}

function getKothVaultPDA() {
  return PublicKey.findProgramAddressSync([Buffer.from("koth_vault")], CHOPCORP_PROGRAM_ID)[0];
}

function getWatchdogRegistryPDA() {
  return PublicKey.findProgramAddressSync([Buffer.from("watchdog_registry")], CHOPCORP_PROGRAM_ID)[0];
}

function getAssociatedTokenAddress(mint, owner) {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}

function parseTokenAccountBalance(data) {
  if (data.length < 72) return 0n;
  return data.readBigUInt64LE(64);
}

async function getLogPriceInSol(connection) {
  try {
    const [logVaultInfo, solVaultInfo] = await Promise.all([
      connection.getAccountInfo(METEORA_LOG_VAULT),
      connection.getAccountInfo(METEORA_SOL_VAULT),
    ]);
    if (!logVaultInfo || !solVaultInfo) return 0;
    
    const logBalance = parseTokenAccountBalance(logVaultInfo.data);
    const solBalance = parseTokenAccountBalance(solVaultInfo.data);
    if (logBalance === 0n) return 0;
    
    return (Number(solBalance) / 1e9) / (Number(logBalance) / 1e11);
  } catch (e) {
    return 0;
  }
}

function logToSolLamports(logAmount, logPriceInSol) {
  if (logPriceInSol === 0) return 0n;
  const solDecimal = (Number(logAmount) / 1e11) * logPriceInSol;
  return BigInt(Math.floor(solDecimal * 1e9));
}

function parseTreasury(data) {
  const buffer = data.slice(8);
  return {
    lumberlode: buffer.readBigUInt64LE(16),
    totalRefined: buffer.readBigUInt64LE(56),
    totalStaked: buffer.readBigUInt64LE(64),
    totalUnclaimed: buffer.readBigUInt64LE(72),
  };
}

// WatchdogRegistry: 8 (disc) + 32 (current_watchdog) + 8 (highest_stake) + 8 (total_staked) + ...
function parseWatchdogRegistry(data) {
  const buffer = data.slice(8);
  return {
    totalStaked: buffer.readBigUInt64LE(40), // offset: 32 + 8
  };
}

function parsePredictionMarket(data) {
  return { resolved: data.slice(8).readUInt8(32) !== 0 };
}

// TVL: SOL deposits only (user deposits, not protocol-generated tokens)
async function tvl(api) {
  const connection = getConnection();
  let totalSolLamports = 0n;

  const treasuryPDA = getTreasuryPDA();
  const treasuryInfo = await connection.getAccountInfo(treasuryPDA);
  
  if (treasuryInfo) {
    totalSolLamports += BigInt(treasuryInfo.lamports);
  }

  try {
    const wsolMint = new PublicKey(SOL_MINT);
    const treasuryWsolAta = getAssociatedTokenAddress(wsolMint, treasuryPDA);
    const wsolInfo = await connection.getAccountInfo(treasuryWsolAta);
    if (wsolInfo?.data.length >= 72) {
      totalSolLamports += parseTokenAccountBalance(wsolInfo.data);
    }
  } catch (e) {}

  const kothVaultInfo = await connection.getAccountInfo(getKothVaultPDA());
  if (kothVaultInfo) totalSolLamports += BigInt(kothVaultInfo.lamports);

  try {
    const automationAccounts = await connection.getProgramAccounts(CHOPCORP_PROGRAM_ID, {
      filters: [{ memcmp: { offset: 0, bytes: bs58.encode(DISCRIMINATORS.Automation) } }],
    });
    for (const { account } of automationAccounts) {
      if (account.data.length >= 56) {
        totalSolLamports += account.data.readBigUInt64LE(48);
      }
    }
  } catch (e) {}

  try {
    const predictionAccounts = await connection.getProgramAccounts(CHOPCORP_PROGRAM_ID, {
      filters: [{ memcmp: { offset: 0, bytes: bs58.encode(DISCRIMINATORS.PredictionSegmentMarket) } }],
    });
    for (const { account } of predictionAccounts) {
      if (!parsePredictionMarket(account.data).resolved) {
        totalSolLamports += BigInt(account.lamports);
      }
    }
  } catch (e) {}

  api.add(SOL_MINT, totalSolLamports.toString());
}

// Staking: LOG tokens users deposited (yield staking + watchdog competition)
async function staking(api) {
  const connection = getConnection();
  let totalStakedLog = 0n;

  const treasuryInfo = await connection.getAccountInfo(getTreasuryPDA());
  if (treasuryInfo?.data.length > 0) {
    const treasury = parseTreasury(treasuryInfo.data);
    totalStakedLog += treasury.totalStaked;
  }

  const watchdogInfo = await connection.getAccountInfo(getWatchdogRegistryPDA());
  if (watchdogInfo?.data.length > 0) {
    const registry = parseWatchdogRegistry(watchdogInfo.data);
    totalStakedLog += registry.totalStaked;
  }

  const logPriceInSol = await getLogPriceInSol(connection);
  api.add(SOL_MINT, logToSolLamports(totalStakedLog, logPriceInSol).toString());
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "TVL: SOL deposits (treasury, wSOL, KOTH vault, automation, prediction markets). Staking: LOG staked by users (yield staking + watchdog competition), priced via Meteora pool.",
  solana: { tvl, staking },
};
