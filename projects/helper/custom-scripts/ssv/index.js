const https = require("https");
const { pipeline } = require("stream");
const { parser } = require("stream-json");
const { pick } = require("stream-json/filters/Pick");
const { streamArray } = require("stream-json/streamers/StreamArray");
const { getConfig } = require("../../cache");
const sdk = require('@defillama/sdk');
const { get } = require("../../http");

const BEACON_API_URL = "https://ethereum-beacon-api.publicnode.com/eth/v1/beacon/states/head/validators";

async function fetcher() {
  let hasMore = false
  let page = 0
  let lastId = 0
  const perPage = 1000
  let skippedValidatorCount = 0

  const keySet = new Set()
  do {
    const { validators, pagination } = await get(`https://api.ssv.network/api/v4/mainnet/validators?perPage=${perPage}&lastId=${lastId}`)
    // Process current page validators
    validators.forEach(v => {

      skippedValidatorCount++
      // if (v.validator_info?.status === 'withdrawal_done') return;
      // if (v.validator_info?.effective_balance === 0) return;
      skippedValidatorCount--

      const normalizedKey = v.owner_address.toLowerCase()
      if (!keySet.has(normalizedKey)) keySet.add(normalizedKey)
    })
    const itemsInPage = validators.length > 0
      ? pagination.current_last - pagination.current_first + 1
      : 0
    if (itemsInPage < perPage) {
      hasMore = false
    } else {
      hasMore = true
      lastId = pagination.current_last
    }

    console.log(`SSV Network: fetched page ${page + 1}, got ${validators.length} validators owners: total keys so far: ${keySet.size}, skipped validators: ${skippedValidatorCount}`)
    page++
  } while (hasMore)
  return Array.from(keySet)
}

/**
 * Streams all validators from beacon chain and computes total balance
 * for validators matching the provided public keys
 * @param {Set<string>} validatorKeys - Set of validator public keys to match
 * @returns {Promise<{totalBalance: number, validatorCount: number}>}
 */
function streamBeaconValidators(validatorKeys) {
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
            console.log(`Processed ${(processedCount / 1e6).toFixed(1)}M validators... balance so far: ${totalBalance / 1e9} ETH`);
          }

          let withdrawalCredentials = '0x' + value.validator.withdrawal_credentials.slice(-40).toLowerCase()

          // Check if this validator's public key matches our SSV keys
          if (validatorKeys.has(withdrawalCredentials)) {
            totalBalance += +value.balance;
            validatorCount++;
          }
        });

        res.on("error", reject);
      })
      .on("error", reject);
  });
}

/**
 * Main function to get SSV Network TVL
 * Fetches validator keys from SSV API, then streams beacon chain data
 * to compute total staked ETH balance
 * @param {object} api - DefiLlama API object
 */
async function getSsvTvl(api) {
  console.log("Fetching SSV validator keys...");
  const validators = await getConfig(`ssv-network/validators`, undefined, { fetcher });
  const validatorsSet = new Set(validators);
  console.log(`Found ${validatorsSet.size} SSV validator keys`);

  console.log("Streaming beacon chain validators...");
  const { totalBalance, validatorCount } = await streamBeaconValidators(validatorsSet);
  console.log(`Matched ${validatorCount} validators with total balance: ${totalBalance / 1e9} ETH`);

  // Balance from beacon API is in gwei, convert to wei
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