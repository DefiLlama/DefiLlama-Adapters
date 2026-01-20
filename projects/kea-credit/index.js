// KEA Credit Contract Addresses on Hedera
const INVOICE_FACTORY_PROXY = "0x79914D3C80246FBC9E40409C4688A4141A3abbCe";

// Pool Status Constants - V1/V2
const POOL_STATUS_V1V2 = {
  ACTIVE: 0,
  FUNDED: 1,
  REPAID: 2,
  DEFAULTED: 3,
  CANCELLED: 4,
  GRACE_PERIOD: 5, // V2 only
};

// Pool Status Constants - V3 (upgraded contracts)
const POOL_STATUS_V3 = {
  ACTIVE: 0,
  FUNDED: 1,
  PARTIALLY_FUNDED: 2, // New in V3
  REPAID: 3, // Changed from 2
  DEFAULTED: 4, // Changed from 3
  CANCELLED: 5, // Changed from 4
  REFUNDED: 6, // New in V3
};

// Contract ABIs (essential functions only)
const FACTORY_ABI = [
  "function getAllPools() external view returns (address[] memory)",
  "function totalPools() external view returns (uint256)",
];

const POOL_V1_ABI = [
  // V1 Pool ABI (simpler structure)
  "function getPoolInfo() external view returns (uint256 nftTokenId, uint256 targetAmount, uint256 currentAmount, uint256 interestRate, uint256 maturityDate, address borrower, uint8 status, uint256 platformFeePercentage, address treasuryWallet)",
];

const POOL_V3_ABI = [
  // V3 Pool ABI (upgraded from V2)
  "function getPoolInfo() external view returns (uint256 nftTokenId, uint256 targetAmount, uint256 minAcceptableAmount, uint256 currentAmount, uint256 disbursedAmount, uint256 interestRate, uint256 originationDate, uint256 gracePeriodEndTime, uint256 maturityDate, address borrower, uint8 status, bool gracePeriodProcessed, address bridgeWalletAddress, uint256 supportedTokenCount)",
];

/**
 * Calculate TVL for a single pool based on its status
 */
function calculatePoolTVL(poolInfo, version) {
  let status,
    currentAmount,
    targetAmount,
    gracePeriodEndTime,
    gracePeriodProcessed;
  let tvlAmount = 0;

  if (version === "v1") {
    // V1: [0]nftTokenId, [1]targetAmount, [2]currentAmount, [3]interestRate, [4]maturityDate, [5]borrower, [6]status, [7]platformFeePercentage, [8]treasuryWallet
    status = Number(poolInfo[6]);
    targetAmount = poolInfo[1];
    currentAmount = poolInfo[2];

    switch (status) {
      case POOL_STATUS_V1V2.ACTIVE:
        // V1: Convert from 18-decimal internal format to USD
        tvlAmount = Number(currentAmount) / 1e18;
        break;
      case POOL_STATUS_V1V2.FUNDED:
        tvlAmount = Number(targetAmount) / 1e18;
        break;
      case POOL_STATUS_V1V2.REPAID:
      case POOL_STATUS_V1V2.CANCELLED:
      case POOL_STATUS_V1V2.DEFAULTED:
        tvlAmount = 0;
        break;
      default:
        tvlAmount = 0;
    }
  } else if (version === "v3") {
    // V3: [0]nftTokenId, [1]targetAmount, [2]minAcceptableAmount, [3]currentAmount, [4]disbursedAmount,
    //     [5]interestRate, [6]originationDate, [7]gracePeriodEndTime, [8]maturityDate, [9]borrower,
    //     [10]status, [11]gracePeriodProcessed, [12]bridgeWalletAddress, [13]supportedTokenCount
    status = Number(poolInfo[10]);
    targetAmount = poolInfo[1];
    currentAmount = poolInfo[3];
    gracePeriodEndTime = Number(poolInfo[7]);
    gracePeriodProcessed = poolInfo[11];

    switch (status) {
      case POOL_STATUS_V3.ACTIVE:
        // Active pools: count current invested amount
        tvlAmount = Number(currentAmount) / 1e6;
        break;

      case POOL_STATUS_V3.FUNDED:
        // Funded pools: count target amount (fully funded)
        tvlAmount = Number(targetAmount) / 1e6;

        // Check if in grace period (not yet processed and grace period active)
        if (!gracePeriodProcessed && gracePeriodEndTime > 0) {
          const now = Math.floor(Date.now() / 1000);
          if (now < gracePeriodEndTime) {
            // Still in grace period, count current amount instead
            tvlAmount = Number(currentAmount) / 1e6;
          }
        }
        break;

      case POOL_STATUS_V3.PARTIALLY_FUNDED:
        // Partially funded pools: count current amount
        tvlAmount = Number(currentAmount) / 1e6;
        break;

      case POOL_STATUS_V3.REPAID:
      case POOL_STATUS_V3.CANCELLED:
      case POOL_STATUS_V3.DEFAULTED:
      case POOL_STATUS_V3.REFUNDED:
        // No TVL for completed/cancelled pools
        tvlAmount = 0;
        break;

      default:
        tvlAmount = 0;
    }
  }

  return tvlAmount;
}

/**
 * Main TVL calculation for Hedera
 */
async function hederaTvl(api) {
  // Get all pool addresses
  const poolAddresses = await api.call({    target: INVOICE_FACTORY_PROXY,    abi: FACTORY_ABI[0],  });
  const v1Pools = poolAddresses.slice(0, 12)
  const v3Pools = poolAddresses.slice(12)
  const poolV1Info = await api.multiCall({  abi: POOL_V1_ABI[0] , calls: v1Pools})
  const poolV3Info = await api.multiCall({  abi: POOL_V3_ABI[0] , calls: v3Pools})

  const v1Tvls = poolV1Info.map(info => calculatePoolTVL(info, "v1"))
  const v3Tvls = poolV3Info.map(info => calculatePoolTVL(info, "v3"))

  api.addUSDValue(v1Tvls.concat(v3Tvls).reduce((a, b) => a + b, 0))
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL represents the total value locked in KEA Credit's RWA (Real World Assets) invoice tokenization platform on Hedera. Businesses tokenize their invoices as NFTs and receive funding from lenders through investment pools. TVL calculation includes: (1) Active pools - current invested amounts, (2) Funded pools - fully funded target amounts, (3) Partially funded pools - current invested amounts, (4) Pools in grace period - current amounts during active grace period. Excludes repaid, cancelled, defaulted, or refunded pools. The platform operates with two versions: V1 pools (NFT IDs 1-12) using 0-decimal PIXD tokens, and V3 pools (NFT IDs 13+) using 6-decimal kUSD tokens. Both tokens maintain 1:1 USD parity representing underlying invoice values.",
  hedera: {
    tvl: hederaTvl,
  },
};
