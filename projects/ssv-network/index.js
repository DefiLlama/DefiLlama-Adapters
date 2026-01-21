const { default: runInPromisePool } = require("@defillama/sdk/build/util/promisePool");
const { getCache, setCache } = require("../helper/cache");
const { beacon } = require("../helper/chain/rpcProxy");
const { nullAddress } = require("../helper/tokenMapping");

// SSVNetwork (Ethereum mainnet)
const SSV_NETWORK = "0xDD9BC35aE942eF0cFa76930954a156B3fF30a4E1";
const DEPLOY_BLOCK = 17507487; // contract creation block
const PROJECT_KEY = "ssv-network";
const CHAIN_KEY = "ethereum-pubkeyIndex-v1";  // Changed from ownerIndex to pubkeyIndex

// Event ABIs for ValidatorAdded and ValidatorRemoved
const VALIDATOR_ADDED_ABI =
  "event ValidatorAdded(address indexed owner, uint64[] operatorIds, bytes publicKey, bytes shares, tuple(uint32 validatorCount, uint64 networkFeeIndex, uint64 index, bool active, uint256 balance) cluster)";
const VALIDATOR_REMOVED_ABI =
  "event ValidatorRemoved(address indexed owner, uint64[] operatorIds, bytes publicKey, tuple(uint32 validatorCount, uint64 networkFeeIndex, uint64 index, bool active, uint256 balance) cluster)";

// Max blocks to process per batch in the sync loop
// Reduced to 20k to handle high-density event blocks without memory issues
const MAX_BLOCKS_PER_RUN = 20_000;

// Reorg buffer: only sync to head - REORG_BUFFER to avoid reorg-induced data inconsistency
// 64 blocks ≈ ~13 minutes of confirmation time
const REORG_BUFFER = 64;

async function loadState() {
  try {
    const s = await getCache(PROJECT_KEY, CHAIN_KEY);
    // publicKeys stored as object with keys for O(1) lookup, like a Set
    if (s && typeof s === "object" && s.publicKeys && s.lastBlock != null) return s;
  } catch (e) { }
  return { lastBlock: DEPLOY_BLOCK - 1, publicKeys: {} };
}

async function saveState(state) {
  await setCache(PROJECT_KEY, CHAIN_KEY, state);
}

// Normalize publicKey to lowercase for consistent comparison
function normalizeKey(key) {
  return key.toLowerCase();
}

async function syncValidatorsFromLogs(api, state, safeHead) {
  const startTime = Date.now();

  let fromBlock = state.lastBlock + 1;
  if (fromBlock < DEPLOY_BLOCK) fromBlock = DEPLOY_BLOCK;

  // Already synced to safe head
  if (fromBlock > safeHead) {
    return { publicKeys: Object.keys(state.publicKeys), state, synced: true };
  }

  const toBlock = Math.min(safeHead, fromBlock + MAX_BLOCKS_PER_RUN - 1);
  const blocksToSync = toBlock - fromBlock + 1;
  const totalBlocks = safeHead - DEPLOY_BLOCK;
  const progressPct = totalBlocks > 0
    ? (((toBlock - DEPLOY_BLOCK) / totalBlocks) * 100).toFixed(1)
    : '0.0';

  console.log(`[SSV] Syncing events from block ${fromBlock} to ${toBlock} (safe head: ${safeHead})`);
  console.log(`[SSV] Progress: ${progressPct}% | Blocks to process: ${blocksToSync.toLocaleString()}`);

  // Fetch incremental logs: Added / Removed (in parallel for better performance)
  const [addedLogs, removedLogs] = await Promise.all([
    api.getLogs({ target: SSV_NETWORK, eventAbi: VALIDATOR_ADDED_ABI, fromBlock, toBlock, onlyArgs: true }),
    api.getLogs({ target: SSV_NETWORK, eventAbi: VALIDATOR_REMOVED_ABI, fromBlock, toBlock, onlyArgs: true }),
  ]);

  console.log(`[SSV] ✓ Found ${addedLogs.length} ValidatorAdded, ${removedLogs.length} ValidatorRemoved events`);

  // Update publicKeys set: Added -> add, Removed -> delete
  // publicKey is log.publicKey (bytes, hex encoded)
  addedLogs.forEach((log) => {
    const key = normalizeKey(log.publicKey);
    state.publicKeys[key] = true;  // Using object as Set
  });

  removedLogs.forEach((log) => {
    const key = normalizeKey(log.publicKey);
    delete state.publicKeys[key];  // Remove from Set
  });

  state.lastBlock = toBlock;
  await saveState(state);

  const publicKeyCount = Object.keys(state.publicKeys).length;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[SSV] Batch completed in ${elapsed}s`);
  console.log(`[SSV] Running totals: ${publicKeyCount} active validators, +${addedLogs.length} added, -${removedLogs.length} removed`);

  return { publicKeys: Object.keys(state.publicKeys), state, synced: toBlock >= safeHead };
}

function printStats(state) {
  const publicKeysList = Object.keys(state.publicKeys);
  console.log('\n========== SSV STATISTICS ==========');
  console.log(`Total active validators (publicKeys): ${publicKeysList.length}`);
  console.log(`Synced up to block: ${state.lastBlock}`);
  console.log('=====================================\n');
}

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const fullSyncStart = Date.now();
      let state = await loadState();
      const head = await api.getBlock();
      const safeHead = Math.max(DEPLOY_BLOCK, head - REORG_BUFFER);

      let publicKeysList = Object.keys(state.publicKeys);  // Initialize with current state
      let iteration = 0;

      console.log(`[SSV] Starting sync to safe head ${safeHead} (actual head: ${head})`);

      // Loop until fully synced
      while (state.lastBlock < safeHead) {
        iteration++;
        console.log(`\n[SSV] === Iteration ${iteration} ===`);

        const result = await syncValidatorsFromLogs(api, state, safeHead);
        publicKeysList = result.publicKeys;
        state = result.state;

        if (result.synced) {
          break;
        }
      }

      const fullSyncElapsed = ((Date.now() - fullSyncStart) / 1000).toFixed(2);
      console.log(`\n[SSV] Full sync completed in ${fullSyncElapsed}s (${iteration} iterations)`);
      printStats(state);

      // Batch beacon.balance queries using publicKey
      const queries = [];
      for (let i = 0; i < publicKeysList.length; i += 30) {
        queries.push(publicKeysList.slice(i, i + 30));
      }

      console.log(`[SSV] Querying beacon.balance for ${publicKeysList.length} validators in ${queries.length} batches`);

      await runInPromisePool({
        items: queries,
        concurrency: 3,
        processor: async (batch) => {
          const balance = await beacon.balance(batch);
          api.add(nullAddress, balance);
        },
      });
    },
  },
};