const { default: runInPromisePool } = require("@defillama/sdk/build/util/promisePool");
const { getCache, setCache } = require("../helper/cache");
const { beacon } = require("../helper/chain/rpcProxy");
const { nullAddress } = require("../helper/tokenMapping");

// SSVNetwork (Ethereum mainnet)
const SSV_NETWORK = "0xDD9BC35aE942eF0cFa76930954a156B3fF30a4E1";
const DEPLOY_BLOCK = 17507487; // contract creation block
const PROJECT_KEY = "ssv-network";
const CHAIN_KEY = "ethereum-pubkeyIndex-v1";

// Event ABIs for ValidatorAdded and ValidatorRemoved
const VALIDATOR_ADDED_ABI =
  "event ValidatorAdded(address indexed owner, uint64[] operatorIds, bytes publicKey, bytes shares, tuple(uint32 validatorCount, uint64 networkFeeIndex, uint64 index, bool active, uint256 balance) cluster)";
const VALIDATOR_REMOVED_ABI =
  "event ValidatorRemoved(address indexed owner, uint64[] operatorIds, bytes publicKey, tuple(uint32 validatorCount, uint64 networkFeeIndex, uint64 index, bool active, uint256 balance) cluster)";

// Max blocks to process per batch in the sync loop
const MAX_BLOCKS_PER_RUN = 20_000;

// Reorg buffer: only sync to head - REORG_BUFFER to avoid reorg-induced data inconsistency
// 64 blocks ≈ ~13 minutes of confirmation time
const REORG_BUFFER = 64;

async function loadState() {
  try {
    const s = await getCache(PROJECT_KEY, CHAIN_KEY);
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
  let fromBlock = state.lastBlock + 1;
  if (fromBlock < DEPLOY_BLOCK) fromBlock = DEPLOY_BLOCK;

  // Already synced to safe head
  if (fromBlock > safeHead) {
    return { publicKeys: Object.keys(state.publicKeys), state, synced: true };
  }

  const toBlock = Math.min(safeHead, fromBlock + MAX_BLOCKS_PER_RUN - 1);

  // Fetch incremental logs: Added / Removed (in parallel for better performance)
  const [addedLogs, removedLogs] = await Promise.all([
    api.getLogs({ target: SSV_NETWORK, eventAbi: VALIDATOR_ADDED_ABI, fromBlock, toBlock, onlyArgs: true }),
    api.getLogs({ target: SSV_NETWORK, eventAbi: VALIDATOR_REMOVED_ABI, fromBlock, toBlock, onlyArgs: true }),
  ]);

  // Update publicKeys set: Added -> add, Removed -> delete
  addedLogs.forEach((log) => {
    const key = normalizeKey(log.publicKey);
    state.publicKeys[key] = true;
  });

  removedLogs.forEach((log) => {
    const key = normalizeKey(log.publicKey);
    delete state.publicKeys[key];
  });

  state.lastBlock = toBlock;
  await saveState(state);

  return { publicKeys: Object.keys(state.publicKeys), state, synced: toBlock >= safeHead };
}

module.exports = {
  ethereum: {
    tvl: async (api) => {
      let state = await loadState();
      const head = await api.getBlock();
      const safeHead = Math.max(DEPLOY_BLOCK, head - REORG_BUFFER);

      let publicKeysList = Object.keys(state.publicKeys);

      // Loop until fully synced
      while (state.lastBlock < safeHead) {
        const result = await syncValidatorsFromLogs(api, state, safeHead);
        publicKeysList = result.publicKeys;
        state = result.state;

        if (result.synced) {
          break;
        }
      }

      // Batch beacon.balance queries using publicKey
      const queries = [];
      for (let i = 0; i < publicKeysList.length; i += 30) {
        queries.push(publicKeysList.slice(i, i + 30));
      }

      await runInPromisePool({
        items: queries,
        concurrency: 3,
        processor: async (batch) => {
          const balance = await beacon.balanceByPublicKeys(batch);
          api.add(nullAddress, balance);
        },
      });
    },
  },
};