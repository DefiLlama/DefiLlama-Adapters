const http = require('../http')
const { getEnv } = require('../env')

const UPDATE_REPS_INTERVAL = 5 * 60 * 1000;

let weightedReps = [];
let updateRepsPromise = null;

/**
 * Updates the known representatives and stores them sorted by their weight.
 */
async function updateReps() {
  const api = weightedReps.length > 0 ? weightedReps[0].api : getEnv('KEETA_RPC');

  const { representatives } = await http.get(`${api}/node/ledger/representatives`);

  const reps = []
  for (const rep of representatives) {
    reps.push({
      weight: BigInt(rep.weight),
      api: rep.endpoints.api,
    });
  }

  reps.sort((rep1, rep2) => {
    if (rep2.weight > rep1.weight) {
      return 1;
    }
    if (rep2.weight < rep1.weight) {
      return -1;
    }
    return 0;
  });

  weightedReps = reps;
}

/**
 * Gets the API endpoint of the currently heighest weighted representative.
 * If the representatives are unknown, it initializes them and schedules a period refresh.
 *
 * @returns URL of the representative's API endpoint
 */
async function getRepresentativeEndpoint() {
  if (weightedReps.length === 0 && !updateRepsPromise) {
    updateRepsPromise = updateReps().catch(function () {
      // Ignore any errors
    });

    // Update reps regularly
    setInterval(() => {
      updateRepsPromise = updateReps().catch(function () {
        // Ignore any errors
      });
    }, UPDATE_REPS_INTERVAL);
  }

  // If an update is running, wait for it
  if (updateRepsPromise) await updateRepsPromise;

  // If fetching the reps fails initially and weightedReps is empty,
  // fall back to the default representative API endpoint.
  if (weightedReps.length === 0) {
    return getEnv('KEETA_RPC');
  }

  // Return the API endpoint of the representative with the most weight
  return weightedReps[0].api;
}

/**
 * Fetch the account information for a given account including the current head block and supply.
 *
 * See https://static.network.keeta.com/docs/classes/KeetaNetSDK.Client.html#getaccountinfo
 *
 * @param {string} account - Address of the account to fetch the information for
 * @returns The account information
 */
async function getAccountInfo(account) {
  const api = await getRepresentativeEndpoint();

  return await http.get(`${api}/node/ledger/account/${account}`);
}

/**
 * Get the chain for a given account, which is the set of blocks the account has created.
 *
 * See https://static.network.keeta.com/docs/classes/KeetaNetSDK.Client.html#getchain
 *
 * @param {string} account - The account to get the chain for
 * @param {string} startBlock - The block hash to start from -- this is used to paginate the request
 * @returns The chain of blocks for the given account, in reverse order starting with the most recent block
 */
async function getChain(account, startBlock) {
  const api = await getRepresentativeEndpoint();

  let url = `${api}/node/ledger/account/${account}/chain`;

  if (startBlock) {
    url += '?start=' + startBlock;
  }

  const chain = await http.get(url);

  return chain;
}

/**
 * Calculates the change of the token's supply after a given date.
 * Iterates over the blocks in the token's chain from newest to oldest and sums the amount of
 * TOKEN_ADMIN_SUPPLY operations until the targetDate is reached.
 *
 * @param {string} token - Address of the token
 * @param {Date} targetDate - Date after which the supply change should be calculated
 * @param {string} currentHeadBlock - Hash of the block at the head of the chain. Blocks that were added after this hash will be ignored.
 * @returns BigInt representing the change of the supply after the target date
 */
async function supplyChangeAfter(token, targetDate, currentHeadBlock) {
  let supplyChange = 0n;
  let start = null;
  let foundStart = false;
  let timestampReached = false;

  while (!timestampReached) {
    const chain = await getChain(token, start);

    for (const { block } of chain.blocks) {
      // Ignore any potentially newer blocks that were added after our call to get the account info
      if (!foundStart) {
        if (block.$hash === currentHeadBlock) {
          foundStart = true;
        } else {
          continue;
        }
      }

      const blockDate = new Date(block.date);
      if (blockDate < targetDate) {
        timestampReached = true;
        break;
      }

      for (const operation of block.operations) {
        // Only consider TOKEN_ADMIN_SUPPLY operations
        if (operation.type === 5) {
          // Method.ADD
          if (operation.method === 0) {
            supplyChange += BigInt(operation.amount);
          }

          // Method.SUBTRACT
          if (operation.method === 1) {
            supplyChange -= BigInt(operation.amount);
          }
        }
      }
    }

    if (!chain.nextKey) break;

    start = chain.nextKey;
  }

  return supplyChange;
}

/**
 * Gets the supply of a token at the given timestamp on the Keeta mainnet.
 *
 * @param {string} token - Address of the token
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns Supply of the token as a BigInt
 */
async function getSupply(token, timestamp) {
  // There's no API to get the supply of the token at a given point in time,
  // so instead we calculate that in two steps.

  // 1. Get the current info for the token account.
  // This includes the token's current supply.
  const { currentHeadBlock, info } = await getAccountInfo(token);

  // 2. Get the change of the supply between now and the given timestamp by iterating
  // over the chain backwards and summing all supply changes.
  // We pass the currentHeadBlock to ignore any blocks (with potential supply modifications)
  // that have been added to the chain between the two API calls.
  const supplyChange = await supplyChangeAfter(token, new Date(timestamp * 1000), currentHeadBlock);

  // The supply of the token at the given timestamp is the difference between the current supply
  // and the supply change after the given timestamp.
  return BigInt(info.supply) - supplyChange;
}

module.exports = {
  getSupply,
};
