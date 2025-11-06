const { sumTokens: sumBitcoinTokens } = require('../helper/chain/bitcoin');
const { zenrock } = require('../helper/bitcoin-book/fetchers');
const { get } = require('../helper/http');
const sdk = require('@defillama/sdk');

const ZRCHAIN_RPC = 'https://rpc.diamond.zenrocklabs.io';
const ZRCHAIN_API = 'https://api.diamond.zenrocklabs.io';

// Chain launch timestamp (genesis block): 2024-11-20T17:39:07Z
const GENESIS_TIMESTAMP = 1732124347;

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

  // Get latest block timestamp
  const latestBlock = await get(`${ZRCHAIN_RPC}/block?height=${latestHeight}`);
  const latestBlockTime = new Date(latestBlock.result.block.header.time).getTime() / 1000;

  // Estimate block height (5 seconds per block for zrchain)
  const avgBlockTime = 5; // seconds
  const genesisTime = latestBlockTime - (latestHeight * avgBlockTime);
  let estimatedHeight = Math.max(1, Math.min(
    Math.floor((timestamp - genesisTime) / avgBlockTime),
    latestHeight
  ));

  // Refine estimate to ensure accuracy within 60 seconds
  const targetAccuracy = 60; // seconds
  let low = Math.max(1, estimatedHeight - 1000); // Search range: ±1000 blocks
  let high = Math.min(latestHeight, estimatedHeight + 1000);
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

  try {
    return await get(url, options);
  } catch (error) {
    // If historical query fails (code 13 - nil pointer), throw descriptive error
    // This indicates either: (1) the module was not present on-chain at this block height,
    // or (2) historical state has been pruned (varies by module - DCT was launched on 2025-10-31)
    const errorStr = error.message || error.toString() || '';
    if (errorStr.includes('code 13') || errorStr.includes('nil pointer')) {
      throw new Error(`Historical data unavailable for block height ${blockHeight}. The module may not have been present on-chain at this block height, or historical state may have been pruned (varies by module).`);
    }
    throw error;
  }
}

async function tvl(api) {
  // Extract timestamp from api parameter
  const timestamp = api?.timestamp;
  const now = Date.now() / 1000;

  // Determine block height for historical queries
  let blockHeight = null;
  if (timestamp && (now - timestamp) > 3600) {
    blockHeight = await timestampToBlockHeight(timestamp);
  }

  // Fetch all protocol addresses (treasury + change) from the bitcoin-book fetcher
  // Pass blockHeight for historical queries
  const allAddresses = await zenrock(blockHeight);

  if (allAddresses.length === 0) {
    return { bitcoin: '0' };
  }

  // Use Bitcoin helper to sum balances for all addresses
  // Pass timestamp if available for historical queries
  const balances = {};
  await sumBitcoinTokens({ balances, owners: allAddresses, timestamp });

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
  const supplyData = await apiRequest(`${ZRCHAIN_API}/dct/supply`, blockHeight);

  // Find ASSET_ZENZEC in supplies array
  const zenZecSupply = supplyData.supplies?.find(
    item => item.supply?.asset === 'ASSET_ZENZEC'
  );

  if (zenZecSupply && zenZecSupply.supply?.custodied_amount) {
    // custodied_amount is in Zatoshi (smallest unit, like satoshis for BTC)
    // Convert to ZEC by dividing by 1e8
    const custodiedAmount = Number(zenZecSupply.supply.custodied_amount);
    const custodiedZEC = custodiedAmount / 1e8;

    sdk.util.sumSingleBalance(balances, 'zcash', custodiedZEC);
  }

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
