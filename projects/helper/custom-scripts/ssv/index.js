const https = require("https");
const { pipeline } = require("stream");
const { parser } = require("stream-json");
const { pick } = require("stream-json/filters/Pick");
const { streamArray } = require("stream-json/streamers/StreamArray");
const sdk = require('@defillama/sdk');

const BEACON_API_URL = "https://ethereum-beacon-api.publicnode.com/eth/v1/beacon/states/finalized/validators";

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

async function streamBeaconValidatorsWithRetry(maxRetries = 3) {
  let lastErr
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) console.log(`Beacon stream attempt ${attempt}/${maxRetries}...`)
      return await streamBeaconValidators()
    } catch (e) {
      lastErr = e
      const isTransient = e.code === 'ERR_SSL_DECRYPTION_FAILED_OR_BAD_RECORD_MAC'
        || e.code === 'ECONNRESET'
        || e.code === 'ETIMEDOUT'
        || e.code === 'ENOTFOUND'
        || e.code === 'EAI_AGAIN'
        || /socket hang up/i.test(e.message || '')
      if (!isTransient || attempt === maxRetries) throw e
      const wait = 5000 * attempt
      console.log(`Beacon stream failed (${e.code || e.message}), retrying in ${wait / 1000}s...`)
      await new Promise(r => setTimeout(r, wait))
    }
  }
  throw lastErr
}

const abis = {
  ValidatorAdded: 'event ValidatorAdded(address indexed owner, uint64[] operatorIds, bytes publicKey, bytes shares, (uint32 validatorCount, uint64 networkFeeIndex, uint64 index, bool active, uint256 balance) cluster)',
  ValidatorRemoved: 'event ValidatorRemoved(address indexed owner, uint64[] operatorIds, bytes publicKey, (uint32 validatorCount, uint64 networkFeeIndex, uint64 index, bool active, uint256 balance) cluster)'
}

let validatorPubKeys = new Set()

const SSV_CONTRACT = '0xDD9BC35aE942eF0cFa76930954a156B3fF30a4E1'
const DEPLOY_TIMESTAMP = 1685577600 // block 17507487
const INTER_CALL_DELAY_MS = 10000

async function getValidatorsFromEvents() {
  let fromTimestamp = DEPLOY_TIMESTAMP
  const toTimestamp = Math.floor(Date.now() / 1000) - 3600

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
    Object.keys(localValidatorCache.data).forEach(key => validatorPubKeys.add(key))
    return
  }

  console.log(`Fetching validator events from SSV Network from timestamp ${fromTimestamp} to ${toTimestamp}...`)

  // Fetch Removes first into an ordinal map (latest remove ordinal per pubkey)
  let removedSeen = 0
  const removeOrdinals = {}
  await sdk.indexer.getLogs({
    target: SSV_CONTRACT,
    eventAbi: abis.ValidatorRemoved,
    onlyArgs: false,
    clientStreaming: true,
    collect: false,
    all: true,
    limit: 'all',
    fromTimestamp,
    toTimestamp,
    decoderType: 'ethers',
    processor: (event) => {
      if (!Array.isArray(event)) event = [event]
      for (const ev of event) {
        const key = ev.args.publicKey.toLowerCase()
        const ord = ev.blockNumber * 1e5 + ev.logIndex
        if (!removeOrdinals[key] || removeOrdinals[key] < ord) removeOrdinals[key] = ord
        removedSeen++
      }
    },
  })
  console.log(`ValidatorRemoved events seen: ${removedSeen}`)

  // Pause to let the SDK clean up its streaming state before the next big call
  await new Promise(r => setTimeout(r, INTER_CALL_DELAY_MS))

  let addedCount = 0
  await sdk.indexer.getLogs({
    target: SSV_CONTRACT,
    eventAbi: abis.ValidatorAdded,
    onlyArgs: false,
    clientStreaming: true,
    collect: false,
    all: true,
    limit: 'all',
    fromTimestamp,
    toTimestamp,
    decoderType: 'ethers',
    processor: (event) => {
      if (!Array.isArray(event)) event = [event]
      for (const ev of event) {
        const key = ev.args.publicKey.toLowerCase()
        localValidatorCache.data[key] = ev.blockNumber * 1e5 + ev.logIndex
        addedCount++
      }
    },
  })
  console.log(`ValidatorAdded events processed: ${addedCount}`)

  // Apply removes against the populated add cache
  let removedApplied = 0
  for (const [key, removeOrd] of Object.entries(removeOrdinals)) {
    if (localValidatorCache.data[key] && localValidatorCache.data[key] < removeOrd) {
      delete localValidatorCache.data[key]
      removedApplied++
    }
  }
  console.log(`ValidatorRemoved events applied: ${removedApplied}`)

  localValidatorCache.fromTimestamp = toTimestamp

  await sdk.cache.writeCache(`ssv-network/validator-events`, localValidatorCache, {
    skipCompression: true,
    skipR2Cache: true,
  })

  Object.keys(localValidatorCache.data).forEach(key => validatorPubKeys.add(key))
  console.log(`Total unique active validator keys: ${validatorPubKeys.size}`)
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
  const { totalBalance, validatorCount } = await streamBeaconValidatorsWithRetry();
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