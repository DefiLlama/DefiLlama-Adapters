const { sumTokens: sumBitcoinTokens } = require('../helper/chain/bitcoin');
const { zenrock } = require('../helper/bitcoin-book/fetchers');
const { get } = require('../helper/http');
const sdk = require('@defillama/sdk');

const ZRCHAIN_RPC = 'https://rpc.diamond.zenrocklabs.io';
const ZRCHAIN_API = 'https://api.diamond.zenrocklabs.io';

// Chain launch timestamp (genesis block): 2024-11-20T17:39:07Z
const GENESIS_TIMESTAMP = 1732124347;

// Timestamp cutoff: use address-based counting for queries >= 2025-11-09
// Use supply API for historical queries before this date
const ADDRESS_COUNTING_CUTOFF_TIMESTAMP = 1762646400; // 2025-11-09T00:00:00Z

// Cache for block height lookups to avoid repeated RPC calls
const blockHeightCache = new Map();

async function timestampToBlockHeight(timestamp) {
  // Ensure timestamp is not before chain launch
  if (timestamp < GENESIS_TIMESTAMP) {
    throw new Error(`Timestamp ${timestamp} is before chain genesis (${GENESIS_TIMESTAMP})`);
  }

  // Check cache first (cache by day to reduce API calls)
  const dayKey = Math.floor(timestamp / 86400);
  if (blockHeightCache.has(dayKey)) {
    return blockHeightCache.get(dayKey);
  }

  // Get latest block height
  const status = await get(`${ZRCHAIN_RPC}/status`);
  const latestHeight = parseInt(status.result.sync_info.latest_block_height);

  // Estimate block height using actual average block time (calculated from chain data)
  // Average block time is ~5.65 seconds, using 5.65 for better accuracy
  const avgBlockTime = 5.65; // seconds (calculated from actual chain data)
  let estimatedHeight = Math.max(1, Math.min(
    Math.floor((timestamp - GENESIS_TIMESTAMP) / avgBlockTime),
    latestHeight
  ));

  // Refine estimate to ensure accuracy within 60 seconds
  const targetAccuracy = 60; // seconds
  // Use search range: ±5% of chain height or ±100000 blocks, whichever is larger
  // This handles cases where initial estimate might be significantly off (e.g., 36 hours)
  // Binary search is logarithmic, so larger range adds minimal overhead (13-14 iterations)
  // 5% ≈ 277k blocks currently, providing good safety margin for edge cases
  const searchRange = Math.max(100000, Math.floor(latestHeight * 0.05));
  let low = Math.max(1, estimatedHeight - searchRange);
  let high = Math.min(latestHeight, estimatedHeight + searchRange);
  let bestHeight = estimatedHeight;
  let bestDiff = Infinity;

  // Binary search to find block within target accuracy
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await get(`${ZRCHAIN_RPC}/block?height=${mid}`);
    const blockTime = new Date(block.result.block.header.time).getTime() / 1000;
    const diff = Math.abs(blockTime - timestamp);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestHeight = mid;
    }

    // If within target accuracy, we're done
    if (diff <= targetAccuracy) {
      estimatedHeight = mid;
      break;
    }

    if (blockTime < timestamp) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // Use best height found if we didn't find one within accuracy
  if (bestDiff > targetAccuracy) {
    estimatedHeight = bestHeight;
  }

  // Cache the result
  blockHeightCache.set(dayKey, estimatedHeight);

  // Limit cache size
  if (blockHeightCache.size > 100) {
    const firstKey = blockHeightCache.keys().next().value;
    blockHeightCache.delete(firstKey);
  }

  return estimatedHeight;
}

// Helper function to make API requests with optional height header
async function apiRequest(url, blockHeight = null) {
  const options = {};
  if (blockHeight) {
    options.headers = {
      'x-cosmos-block-height': String(blockHeight)
    };
  }
  return await get(url, options);
}

async function tvl(api) {
  const balances = {};

  // Extract timestamp from api parameter
  const timestamp = api?.timestamp;
  const now = Date.now() / 1000;
  const queryTimestamp = timestamp || now;

  // Use address-based counting for current/recent queries (>= 2025-11-09)
  // Use supply API for historical queries (before 2025-11-09)
  if (queryTimestamp >= ADDRESS_COUNTING_CUTOFF_TIMESTAMP) {
    const allAddresses = await zenrock();
    if (allAddresses.length === 0) {
      return { bitcoin: '0' };
    }
    await sumBitcoinTokens({ balances, owners: allAddresses, timestamp });
    return balances;
  }

  // Historical queries: use supply API
  // Determine block height for historical queries
  let blockHeight = null;
  if (timestamp && (now - timestamp) > 3600) {
    blockHeight = await timestampToBlockHeight(timestamp);
  }

  // Fetch custodied amount from zenbtc supply endpoint with height header
  let supplyData;
  try {
    supplyData = await apiRequest(`${ZRCHAIN_API}/zenbtc/supply`, blockHeight);
  } catch (error) {
    // If zenbtc supply API fails, return 0 supply instead of erroring
    // This can happen for historical queries before the module was launched
    return balances;
  }
  if (!supplyData?.custodiedBTC) {
    return balances;
  }
  // custodiedBTC is in satoshis (smallest unit)
  const custodiedAmount = Number(supplyData.custodiedBTC);
  const custodiedBTC = custodiedAmount / 1e8;

  sdk.util.sumSingleBalance(balances, 'bitcoin', custodiedBTC);

  return balances;
}

async function zcashTvl(api) {
  const balances = {};

  // Extract timestamp from api parameter
  const timestamp = api?.timestamp;
  const now = Date.now() / 1000;

  // Determine block height for historical queries
  let blockHeight = null;
  if (timestamp && (now - timestamp) > 3600) {
    blockHeight = await timestampToBlockHeight(timestamp);
  }

  // Fetch custodied amount from DCT supply endpoint with height header
  let supplyData;
  try {
    supplyData = await apiRequest(`${ZRCHAIN_API}/dct/supply`, blockHeight);
  } catch (error) {
    // If DCT supply API fails, return 0 supply instead of erroring
    // This can happen for historical queries before the module was launched (2025-10-31)
    return balances;
  }
  const zenZecSupply = supplyData.supplies?.find(
    item => item.supply?.asset === 'ASSET_ZENZEC'
  );
  if (!zenZecSupply?.supply?.custodied_amount) {
    return balances;
  }
  // custodied_amount is in Zatoshi (smallest unit, like satoshis for BTC)
  const custodiedAmount = Number(zenZecSupply.supply.custodied_amount);
  const custodiedZEC = custodiedAmount / 1e8;

  sdk.util.sumSingleBalance(balances, 'zcash', custodiedZEC);

  return balances;
}

module.exports = {
  timetravel: true,
  start: GENESIS_TIMESTAMP,
  methodology: 'zrchain locks native assets through its decentralized MPC network. zenBTC, Zenrock\'s flagship product, is a yield-bearing wrapped Bitcoin issued on Solana and EVM chains. TVL represents the total Bitcoin locked in zrchain treasury addresses. All zenBTC is fully backed by native Bitcoin, with the price of zenBTC anticipated to increase as yield payments are made continuously.',
  bitcoin: {
    tvl,
  },
  zcash: {
    tvl: zcashTvl,
  },
};
