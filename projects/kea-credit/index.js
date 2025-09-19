const sdk = require("@defillama/sdk");

// KEA Credit Contract Addresses on Hedera
const INVOICE_FACTORY_PROXY = "0x79914D3C80246FBC9E40409C4688A4141A3abbCe";
const INVOICE_NFT_PROXY = "0x28E99733E84dE18fF6f50024F6ad33483B3D7F80";

// Token Addresses (Hedera format: 0.0.tokenId)
const TOKENS = {
  PIXD_V1: "0.0.9323052", // 0x00000000000000000000000000000000008e422c (0-decimal)
  KUSD_V2: "0.0.9590855", // 0x0000000000000000000000000000000000925847 (6-decimal)
};

// Pool Status Constants (matching KEA smart contracts)
const POOL_STATUS = {
  ACTIVE: 0, // Seeking funding
  FUNDED: 1, // Fully funded, loan disbursed
  REPAID: 2, // Loan repaid, lenders can withdraw
  DEFAULTED: 3, // Loan defaulted
  CANCELLED: 4, // Pool cancelled
  GRACE_PERIOD: 5, // In grace period (V2 only)
};

// Contract ABIs (essential functions only)
const FACTORY_ABI = [
  "function getAllPools() external view returns (address[] memory)",
  "function totalPools() external view returns (uint256)",
];

const NFT_ABI = [
  "function getNextTokenId() external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
];

const POOL_ABI = [
  // V2 Pool ABI (with grace period support)
  "function getPoolInfo() external view returns (uint256 nftTokenId, uint256 targetAmount, uint256 minAcceptableAmount, uint256 currentAmount, uint256 disbursedAmount, uint256 interestRate, uint256 maturityDate, address borrower, uint8 status, uint256 gracePeriodDays, uint256 minAcceptabilityPercentage, uint256 platformFeePercentage, address treasuryWallet, bool isGracePeriodExpired)",
];

const POOL_V1_ABI = [
  // V1 Pool ABI (simpler structure)
  "function getPoolInfo() external view returns (uint256 nftTokenId, uint256 targetAmount, uint256 currentAmount, uint256 interestRate, uint256 maturityDate, address borrower, uint8 status, uint256 platformFeePercentage, address treasuryWallet)",
];

/**
 * Determine if a token ID represents V1 or V2
 * Our first 12 NFTs are V1, rest are V2
 */
function getVersionFromTokenId(tokenId) {
  return Number(tokenId) <= 12 ? "v1" : "v2";
}

/**
 * Get token configuration based on version
 */
function getTokenConfig(version) {
  return {
    address: version === "v1" ? TOKENS.PIXD_V1 : TOKENS.KUSD_V2,
    decimals: version === "v1" ? 0 : 6,
    symbol: version === "v1" ? "PIXD" : "kUSD",
  };
}

/**
 * Calculate TVL for a single pool based on its status
 */
function calculatePoolTVL(poolInfo, version) {
  const status = Number(poolInfo.status || poolInfo[8]); // Handle both V1 and V2 formats

  // Get amounts from pool info (different positions for V1 vs V2)
  let currentAmount, targetAmount;

  if (version === "v1") {
    // V1: [nftTokenId, targetAmount, currentAmount, interestRate, maturityDate, borrower, status, platformFeePercentage, treasuryWallet]
    // V1 stores amounts in 18-decimal format (contract internal format)
    targetAmount = poolInfo[1] || poolInfo.targetAmount;
    currentAmount = poolInfo[2] || poolInfo.currentAmount;
  } else {
    // V2: [nftTokenId, targetAmount, minAcceptableAmount, currentAmount, disbursedAmount, ...]
    // V2 stores amounts in 6-decimal format (USDC-like format)
    targetAmount = poolInfo[1] || poolInfo.targetAmount;
    currentAmount = poolInfo[3] || poolInfo.currentAmount;
  }

  let tvlAmount = 0;

  switch (status) {
    case POOL_STATUS.ACTIVE:
      // Active pools: count current invested amount
      if (version === "v1") {
        // V1: Convert from 18-decimal internal format to USD
        // 2400000000000000000000 → 2400 USD
        tvlAmount = Number(currentAmount) / 1e18;
      } else {
        // V2: Convert from 6-decimal format to USD
        // 2400000000 → 2400 USD
        tvlAmount = Number(currentAmount) / 1e6;
      }
      break;

    case POOL_STATUS.FUNDED:
      // Funded pools: count target amount (fully funded)
      if (version === "v1") {
        // V1: Convert from 18-decimal internal format to USD
        tvlAmount = Number(targetAmount) / 1e18;
      } else {
        // V2: Convert from 6-decimal format to USD
        tvlAmount = Number(targetAmount) / 1e6;
      }
      break;

    case POOL_STATUS.GRACE_PERIOD:
      // Grace period pools: count current amount
      if (version === "v1") {
        // V1: Convert from 18-decimal internal format to USD
        tvlAmount = Number(currentAmount) / 1e18;
      } else {
        // V2: Convert from 6-decimal format to USD
        tvlAmount = Number(currentAmount) / 1e6;
      }
      break;

    case POOL_STATUS.REPAID:
    case POOL_STATUS.CANCELLED:
    case POOL_STATUS.DEFAULTED:
      // No TVL for completed/cancelled pools
      tvlAmount = 0;
      break;

    default:
      tvlAmount = 0;
  }

  return tvlAmount;
}

/**
 * Get pool info using the appropriate ABI based on pool index
 * First 12 pools (index 0-11) are V1, rest are V2
 */
async function getPoolInfoWithVersion(poolAddress, poolIndex) {
  // Determine version based on pool index (first 12 are V1)
  const version = poolIndex < 12 ? "v1" : "v2";
  const abi = version === "v1" ? POOL_V1_ABI[0] : POOL_ABI[0];

  const result = await sdk.api.abi.call({
    target: poolAddress,
    abi: abi,
    chain: "hedera",
  });

  if (result.output) {
    const tokenId = Number(result.output[0]);
    return {
      success: true,
      poolInfo: result.output,
      version,
      tokenId,
    };
  } else {
    return { success: false, error: "No output from pool call" };
  }
}

/**
 * Main TVL calculation for Hedera
 */
async function hederaTvl() {
  const balances = {};
  let totalV1TVL = 0;
  let totalV2TVL = 0;
  let processedPools = 0;

  // Get total NFTs to understand scale
  // Try getNextTokenId first (KEA Credit specific function)
  let totalNFTs = 0;

  const nextTokenIdResult = await sdk.api.abi.call({
    target: INVOICE_NFT_PROXY,
    abi: NFT_ABI[0], // getNextTokenId
    chain: "hedera",
  });

  if (nextTokenIdResult.output !== undefined) {
    totalNFTs = Number(nextTokenIdResult.output) - 1; // Next token ID - 1 = current total
  } else {
    throw new Error("getNextTokenId returned undefined");
  }

  // Get all pool addresses
  const poolsResult = await sdk.api.abi.call({
    target: INVOICE_FACTORY_PROXY,
    abi: FACTORY_ABI[0],
    chain: "hedera",
  });

  if (poolsResult.output === undefined) {
    throw new Error(
      `Factory getAllPools call failed: ${JSON.stringify(poolsResult)}`
    );
  }

  const poolAddresses = poolsResult.output || [];

  // Process each pool
  for (let i = 0; i < poolAddresses.length; i++) {
    const poolAddress = poolAddresses[i];

    const poolResult = await getPoolInfoWithVersion(poolAddress, i);

    if (!poolResult.success) {
      continue;
    }

    const { poolInfo, version, tokenId } = poolResult;

    // Calculate TVL for this pool
    const poolTVL = calculatePoolTVL(poolInfo, version);

    if (version === "v1") {
      totalV1TVL += poolTVL;
    } else {
      totalV2TVL += poolTVL;
    }

    processedPools++;
  }

  const totalTVL = totalV1TVL + totalV2TVL;

  balances["usd-coin"] = totalTVL;

  return balances;
}

module.exports = {
  methodology:
    "TVL represents the total value locked in KEA Credit's RWA (Real World Assets) invoice tokenization platform on Hedera. Businesses tokenize their invoices as NFTs and receive funding from lenders through investment pools. TVL calculation includes: (1) Active pools - current invested amounts, (2) Funded pools - fully funded target amounts, (3) Grace period pools - current amounts during grace period. Excludes repaid, cancelled, or defaulted pools. The platform operates with two versions: V1 pools (NFT IDs 1-12) using 0-decimal PIXD tokens, and V2 pools (NFT IDs 13+) using 6-decimal kUSD tokens. Both tokens maintain 1:1 USD parity representing underlying invoice values.",
  hedera: {
    tvl: hederaTvl,
  },
};
