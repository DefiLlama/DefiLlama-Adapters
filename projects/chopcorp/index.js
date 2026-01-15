const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");
const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes");

const CHOPCORP_PROGRAM_ID = new PublicKey("chopmfFa3T1CzZj9WUgq5e18aMvjufSHGfPTvyKkydL");
const SOL_MINT = "So11111111111111111111111111111111111111112";

const DISCRIMINATORS = {
  Automation: Buffer.from([100, 0, 0, 0, 0, 0, 0, 0]),
  PredictionSegmentMarket: Buffer.from([117, 0, 0, 0, 0, 0, 0, 0]),
};

function getKothVaultPDA() {
  return PublicKey.findProgramAddressSync([Buffer.from("koth_vault")], CHOPCORP_PROGRAM_ID)[0];
}

function parsePredictionMarket(data) {
  return { resolved: data.slice(8).readUInt8(32) !== 0 };
}

async function tvl(api) {
  const connection = getConnection();
  let totalSolLamports = 0n;

  // KOTH Vault: SOL from seat seizes, claimable by previous seat owners
  const kothVaultInfo = await connection.getAccountInfo(getKothVaultPDA());
  if (kothVaultInfo) {
    totalSolLamports += BigInt(kothVaultInfo.lamports);
  }

  // Automation accounts: User-deposited SOL for auto-chopping, withdrawable anytime
  const automationAccounts = await connection.getProgramAccounts(CHOPCORP_PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(DISCRIMINATORS.Automation) } }],
  });
  for (const { account } of automationAccounts) {
    if (account.data.length >= 56) {
      totalSolLamports += account.data.readBigUInt64LE(48);
    }
  }

  // Prediction markets: User bets in unresolved markets, claimable after resolution
  const predictionAccounts = await connection.getProgramAccounts(CHOPCORP_PROGRAM_ID, {
    filters: [{ memcmp: { offset: 0, bytes: bs58.encode(DISCRIMINATORS.PredictionSegmentMarket) } }],
  });
  for (const { account } of predictionAccounts) {
    if (!parsePredictionMarket(account.data).resolved) {
      totalSolLamports += BigInt(account.lamports);
    }
  }

  api.add(SOL_MINT, totalSolLamports.toString());
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "SOL deposits in KOTH vault (seat seize payouts), automation accounts (auto-chopping deposits), and active prediction markets (user bets).",
  solana: { tvl },
};
