const https = require("https");
const { pipeline } = require("stream");
const { parser } = require("stream-json");
const { pick } = require("stream-json/filters/Pick");
const { streamArray } = require("stream-json/streamers/StreamArray");
const sdk = require('@defillama/sdk');

const BEACON_API_URL = "https://ethereum-beacon-api.publicnode.com/eth/v1/beacon/states/head/validators";

/**
 * Streams all validators from beacon chain and computes total balance
 * for validators matching the provided public keys
 * @param {Set<string>} validatorKeys - Set of validator public keys to match
 * @returns {Promise<{totalBalance: number, validatorCount: number}>}
 */
function streamBeaconValidators(_validatorKeys) {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      headers: { Accept: "application/json" },
    };

    https
      .get(BEACON_API_URL, options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Beacon API returned status code: ${res.statusCode}`));
          res.resume();
          return;
        }

        let totalBalance = 0;
        let validatorCount = 0;
        let processedCount = 0;

        const pipelineStream = pipeline(
          res,
          parser(),
          pick({ filter: "data" }),
          streamArray(),
          (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve({ totalBalance, validatorCount });
          }
        );

        pipelineStream.on("data", ({ value }) => {
          processedCount++;

          if (processedCount % 100000 === 0) {
            console.log(`Processed ${(processedCount / 1e6).toFixed(1)}M validators... balance so far: ${totalBalance / 1e9} ETH for ${validatorCount} matched validators`);
          }

          let pubKey = value.validator.pubkey.toLowerCase()

          // Check if this validator's public key matches our SSV keys
          if (validatorPubKeys.has(pubKey)) {
            totalBalance += +value.balance;
            validatorCount++;
          }
        });

        res.on("error", reject);
      })
      .on("error", reject);
  });
}

const abis = {
  ValidatorAdded: 'event ValidatorAdded(address indexed owner, uint64[] operatorIds, bytes publicKey, bytes shares, tuple(uint32 validatorCount, uint64 networkFeeIndex, uint64 index, bool active, uint256 balance) cluster)',
  ValidatorRemoved: "event ValidatorRemoved(address indexed owner, uint64[] operatorIds, bytes publicKey, tuple(uint32 validatorCount, uint64 networkFeeIndex, uint64 index, bool active, uint256 balance) cluster)"
}

let validatorPubKeys = new Set()

async function getValidatorsFromEvents() {

  let fromTimestamp = 1685577600 // 17507487 // deployed block
  const toTimestamp = Math.floor(Date.now() / 1000) - 3600; // exclude last hour to avoid reorg issues

  const localValidatorCache = await sdk.cache.readCache(`ssv-network/validator-events`, {
    skipCompression: true,
    skipR2Cache: true,
  })

  if (localValidatorCache.fromTimestamp) {
    fromTimestamp = localValidatorCache.fromTimestamp
  } else {
    localValidatorCache.data = {}
  }

  if (toTimestamp <= fromTimestamp - 3 * 3600) {
    console.log("No new blocks to process for validator events")
    return;
  }

  console.log(`Fetching validator events from SSV Network from timestamp ${fromTimestamp} to ${toTimestamp}...`)

  await sdk.indexer.getLogs({
    target: '0xDD9BC35aE942eF0cFa76930954a156B3fF30a4E1',
    eventAbi: abis.ValidatorAdded,
    onlyArgs: false,
    clientStreaming: true,
    collect: false,
    all: true,
    fromTimestamp,
    toTimestamp,
    processor: (event) => {
      if (!Array.isArray(event)) event = [event];

      for (const ev of event) {
        const key = ev.args.publicKey.toLowerCase()
        localValidatorCache.data[key] = ev.blockNumber * 1e5 + ev.logIndex
      }
    },
  })

  await sdk.indexer.getLogs({
    target: '0xDD9BC35aE942eF0cFa76930954a156B3fF30a4E1',
    eventAbi: abis.ValidatorRemoved,
    onlyArgs: false,
    clientStreaming: true,
    collect: false,
    all: true,
    fromTimestamp,
    toTimestamp,
    processor: (event) => {
      if (!Array.isArray(event)) event = [event]

      for (const ev of event) {
        const key = ev.args.publicKey.toLowerCase()
        // Remove key if it exists and was added before this removal event
        if (localValidatorCache.data[key] && localValidatorCache.data[key] < (ev.blockNumber * 1e5 + ev.logIndex)) {
          delete localValidatorCache.data[key]
        }
      }
    },
  })

  localValidatorCache.fromTimestamp = toTimestamp

  console.log(`Total unique validator keys from events: ${validatorPubKeys.size}`)
  await sdk.cache.writeCache(`ssv-network/validator-events`, localValidatorCache, {
    skipCompression: true,
    skipR2Cache: true,
  })

  Object.keys(localValidatorCache.data).forEach(key => validatorPubKeys.add(key))
}

/**
 * Main function to get SSV Network TVL
 * Fetches validator keys from SSV API, then streams beacon chain data
 * to compute total staked ETH balance
 * @param {object} api - DefiLlama API object
 */
async function getSsvTvl(api) {
  console.log("Fetching SSV validator keys...");
  await getValidatorsFromEvents(api)
  console.log(`Total unique validator keys from events: ${validatorPubKeys.size}`);

  // Balance from beacon API is in gwei, convert to wei
  const { totalBalance, validatorCount } = await streamBeaconValidators();
  console.log(`Matched ${validatorCount} validators with total balance: ${totalBalance / 1e9} ETH`);
  api.addGasToken(totalBalance * 1e9);
}

async function main() {

  const api = new sdk.ChainApi({ chain: 'ethereum' })
  await getSsvTvl(api);
  const balances = await api.getBalances();

  console.log("SSV Network TVL:", balances);

  await sdk.elastic.writeLog('custom-scripts', {
    metadata: {
      type: 'tvl',
    },
    chain: 'ethereum',
    project: 'ssv-network',
    balances,
    timestamp: Math.floor(Date.now() / 1000),
  });
}

main().catch((err) => {
  console.error("Error computing SSV Network TVL:", err);
  process.exit(1);
}).then(() => process.exit(0));