const { default: runInPromisePool } = require("@defillama/sdk/build/util/promisePool");
const { getCache, setCache } = require("../helper/cache");
const { beacon } = require("../helper/chain/rpcProxy");
const { nullAddress } = require("../helper/tokenMapping");

// SSVNetwork (Ethereum mainnet)
const SSV_NETWORK = "0xDD9BC35aE942eF0cFa76930954a156B3fF30a4E1";
const DEPLOY_BLOCK = 17507487; // contract creation block
const PROJECT_KEY = "ssv-network";
const CHAIN_KEY = "ethereum-ownerIndex-v1";

// Event ABIs for ValidatorAdded and ValidatorRemoved
const VALIDATOR_ADDED_ABI =
  "event ValidatorAdded(address indexed owner, uint64[] operatorIds, bytes publicKey, bytes shares, tuple(uint32 validatorCount, uint64 networkFeeIndex, uint64 index, bool active, uint256 balance) cluster)";
const VALIDATOR_REMOVED_ABI =
  "event ValidatorRemoved(address indexed owner, uint64[] operatorIds, bytes publicKey, tuple(uint32 validatorCount, uint64 networkFeeIndex, uint64 index, bool active, uint256 balance) cluster)";

// Max blocks to process per batch in the sync loop
// Reduced to 100k to minimize memory usage during full sync
const MAX_BLOCKS_PER_RUN = 100_000;

// Reorg buffer: only sync to head - REORG_BUFFER to avoid reorg-induced data inconsistency
// 64 blocks ≈ ~13 minutes of confirmation time
const REORG_BUFFER = 64;

async function loadState() {
  try {
    const s = await getCache(PROJECT_KEY, CHAIN_KEY);
    if (s && typeof s === "object" && s.ownerCounts && s.lastBlock != null) return s;
  } catch (e) { }
  return { lastBlock: DEPLOY_BLOCK - 1, ownerCounts: {} };
}

async function saveState(state) {
  await setCache(PROJECT_KEY, CHAIN_KEY, state);
}

// Increment/decrement validator count for an owner
// When count reaches 0, owner is removed from the map (no active validators)
function inc(map, owner, delta) {
  const k = owner.toLowerCase();
  const next = (map[k] || 0) + delta;
  if (next <= 0) delete map[k];
  else map[k] = next;
}

async function syncOwnersFromLogs(api, state, safeHead) {
  const startTime = Date.now();

  let fromBlock = state.lastBlock + 1;
  if (fromBlock < DEPLOY_BLOCK) fromBlock = DEPLOY_BLOCK;

  // Already synced to safe head
  if (fromBlock > safeHead) {
    return { owners: Object.keys(state.ownerCounts), state, synced: true };
  }

  const toBlock = Math.min(safeHead, fromBlock + MAX_BLOCKS_PER_RUN - 1);
  const blocksToSync = toBlock - fromBlock + 1;
  const totalBlocks = safeHead - DEPLOY_BLOCK;
  const progressPct = totalBlocks > 0
    ? (((toBlock - DEPLOY_BLOCK) / totalBlocks) * 100).toFixed(1)
    : '0.0';

  console.log(`[SSV] Syncing events from block ${fromBlock} to ${toBlock} (safe head: ${safeHead})`);
  console.log(`[SSV] Progress: ${progressPct}% | Blocks to process: ${blocksToSync.toLocaleString()}`);

  // Fetch incremental logs: Added / Removed
  const addedLogs = await api.getLogs({ target: SSV_NETWORK, eventAbi: VALIDATOR_ADDED_ABI, fromBlock, toBlock, onlyArgs: true });
  const removedLogs = await api.getLogs({ target: SSV_NETWORK, eventAbi: VALIDATOR_REMOVED_ABI, fromBlock, toBlock, onlyArgs: true });

  console.log(`[SSV] ✓ Found ${addedLogs.length} ValidatorAdded, ${removedLogs.length} ValidatorRemoved events`);

  // Update ownerCounts: Added +1, Removed -1
  addedLogs.forEach((log) => inc(state.ownerCounts, log.owner, +1));
  removedLogs.forEach((log) => inc(state.ownerCounts, log.owner, -1));

  state.lastBlock = toBlock;
  await saveState(state);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[SSV] Batch completed in ${elapsed}s (${addedLogs.length + removedLogs.length} events processed)`);

  return { owners: Object.keys(state.ownerCounts), state, synced: toBlock >= safeHead };
}

function printStats(state, owners) {
  console.log('\n========== SSV STATISTICS ==========');
  console.log(`Total unique owners with active validators: ${owners.length}`);

  const totalValidators = Object.values(state.ownerCounts).reduce((sum, count) => sum + count, 0);
  console.log(`Total active validators: ${totalValidators}`);

  if (owners.length > 0) {
    const counts = Object.values(state.ownerCounts);
    const maxValidators = Math.max(...counts);
    const minValidators = Math.min(...counts);
    const avgValidators = (totalValidators / owners.length).toFixed(2);
    console.log(`Validators per owner: min=${minValidators}, max=${maxValidators}, avg=${avgValidators}`);
  }
  console.log(`Synced up to block: ${state.lastBlock}`);

  // Top 10 owners by validator count
  const topOwners = Object.entries(state.ownerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('\nTop 10 owners by validator count:');
  topOwners.forEach(([addr, count], i) => {
    console.log(`  ${i + 1}. ${addr}: ${count} validators`);
  });
  console.log('=====================================\n');
}

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const fullSyncStart = Date.now();
      let state = await loadState();
      const head = await api.getBlock();
      const safeHead = Math.max(DEPLOY_BLOCK, head - REORG_BUFFER);

      let owners = Object.keys(state.ownerCounts);  // Initialize with current state
      let iteration = 0;

      console.log(`[SSV] Starting sync to safe head ${safeHead} (actual head: ${head})`);

      // Loop until fully synced
      while (state.lastBlock < safeHead) {
        iteration++;
        console.log(`\n[SSV] === Iteration ${iteration} ===`);

        const result = await syncOwnersFromLogs(api, state, safeHead);
        owners = result.owners;
        state = result.state;

        if (result.synced) {
          break;
        }
      }

      const fullSyncElapsed = ((Date.now() - fullSyncStart) / 1000).toFixed(2);
      console.log(`\n[SSV] Full sync completed in ${fullSyncElapsed}s (${iteration} iterations)`);
      printStats(state, owners);

      // Batch beacon.balance queries
      const queries = [];
      for (let i = 0; i < owners.length; i += 30) queries.push(owners.slice(i, i + 30));

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