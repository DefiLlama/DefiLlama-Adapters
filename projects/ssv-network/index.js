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
// Note: ValidatorRemoved does NOT have 'shares' parameter (different from ValidatorAdded)
const VALIDATOR_REMOVED_ABI =
  "event ValidatorRemoved(address indexed owner, uint64[] operatorIds, bytes publicKey, tuple(uint32 validatorCount, uint64 networkFeeIndex, uint64 index, bool active, uint256 balance) cluster)";

// Max blocks to process per run
// Production: Each DefiLlama run processes one batch, state is persisted between runs
// Reduced to 300k to avoid memory issues with large event batches
const MAX_BLOCKS_PER_RUN = 300_000;

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

async function syncOwnersFromLogs(api) {
  const startTime = Date.now();
  const state = await loadState();
  const head = await api.getBlock();

  let fromBlock = state.lastBlock + 1;
  if (fromBlock < DEPLOY_BLOCK) fromBlock = DEPLOY_BLOCK;

  // Already synced to head
  if (fromBlock > head) {
    console.log(`[SSV] Already synced to block ${state.lastBlock}, head is ${head}`);
    const owners = Object.keys(state.ownerCounts);
    printStats(state, owners);
    return { owners, state };
  }

  const toBlock = Math.min(head, fromBlock + MAX_BLOCKS_PER_RUN);
  const blocksToSync = toBlock - fromBlock + 1;
  const progressPct = (((toBlock - DEPLOY_BLOCK) / (head - DEPLOY_BLOCK)) * 100).toFixed(1);

  console.log(`[SSV] Syncing events from block ${fromBlock} to ${toBlock} (head: ${head})`);
  console.log(`[SSV] Progress: ${progressPct}% | Blocks to process: ${blocksToSync.toLocaleString()}`);

  // Fetch incremental logs: Added / Removed
  console.log(`[SSV] Fetching ValidatorAdded events...`);
  const addedLogs = await api.getLogs({ target: SSV_NETWORK, eventAbi: VALIDATOR_ADDED_ABI, fromBlock, toBlock, onlyArgs: true });
  console.log(`[SSV] ✓ Found ${addedLogs.length} ValidatorAdded events`);

  console.log(`[SSV] Fetching ValidatorRemoved events...`);
  const removedLogs = await api.getLogs({ target: SSV_NETWORK, eventAbi: VALIDATOR_REMOVED_ABI, fromBlock, toBlock, onlyArgs: true });
  console.log(`[SSV] ✓ Found ${removedLogs.length} ValidatorRemoved events`);

  // Update ownerCounts: Added +1, Removed -1
  addedLogs.forEach((log) => inc(state.ownerCounts, log[0], +1));
  removedLogs.forEach((log) => inc(state.ownerCounts, log[0], -1));

  state.lastBlock = toBlock;
  await saveState(state);

  const owners = Object.keys(state.ownerCounts);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[SSV] Batch completed in ${elapsed}s (${addedLogs.length + removedLogs.length} events processed)`);

  if (toBlock < head) {
    console.log(`[SSV] Still catching up... ${head - toBlock} blocks remaining. Run again to continue.`);
  } else {
    printStats(state, owners);
  }

  return { owners, state };
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
      const { owners } = await syncOwnersFromLogs(api);

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