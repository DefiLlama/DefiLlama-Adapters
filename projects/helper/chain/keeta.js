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
 * @returns {Promise<string>} URL of the representative's API endpoint
 */
async function getRepresentativeEndpoint() {
  if (weightedReps.length === 0 && !updateRepsPromise) {
    updateRepsPromise = updateReps().catch(function () {
      // Ignore any errors
    });

    // Update reps regularly
    const interval = setInterval(() => {
      updateRepsPromise = updateReps().catch(function () {
        // Ignore any errors
      });
    }, UPDATE_REPS_INTERVAL);
    interval.unref();
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
 * @returns {Promise<object>} The account information
 */
async function getAccountInfo(account) {
  const api = await getRepresentativeEndpoint();

  return await http.get(`${api}/node/ledger/account/${account}`);
}

/**
 * Get the history for a given account. This is the set of vote staples that have interacted with the account.
 *
 * See https://static.network.keeta.com/docs/classes/KeetaNetSDK.Client.html#gethistory
 *
 * @param {string} account - The account to get the chain for
 * @param {string} startBlock - The block hash to start from -- this is used to paginate the request
 * @returns {Promise<object>} The chain of blocks for the given account, in reverse order starting with the most recent block
 */
async function getHistory(account, startBlock) {
  const api = await getRepresentativeEndpoint();

  let url = `${api}/node/ledger/account/${account}/history`;

  if (startBlock) {
    url += '?start=' + startBlock;
  }

  const history = await http.get(url);

  return history;
}

/**
 * Calculates the change of the accounts's token balances after a given date.
 * Iterates over the blocks in the account's chain from newest to oldest and sums the amount of
 * SEND and RECEIVE operations until the targetDate is reached.
 *
 * @param {string} account - Address of the account
 * @param {Date} targetDate - Date after which the supply change should be calculated
 * @param {string[]} tokens - The tokens to track the balance changes for
 * @param {string} currentHeadBlock - Hash of the block at the head of the chain. Blocks that were added after this hash will be ignored.
 * @returns {Promise<Map<string, BigInt>>} The change of the token balances after the target date
 */
async function tokenBalanceChangesAfter(account, targetDate, tokens, currentHeadBlock) {
  let start = null;
  let foundStart = false;
  let timestampReached = false;

  const balanceChanges = new Map();
  for (const token of tokens) {
    balanceChanges.set(token, 0n);
  }

  while (!timestampReached) {
    const history = await getHistory(account, start);

    // End of history reached
    if (history.history.length === 0) {
      break;
    }

    for (const { voteStaple } of history.history) {
      // Check potentially newer blocks (part of vote staples) that were added after our call to get the account info
      if (!foundStart) {
        const isHeadStaple = voteStaple.blocks.find(block => block.$hash === currentHeadBlock);
        if (isHeadStaple) {
          foundStart = true;
        } else {
          continue;
        }
      }

      // If any of the votes in the staple was added before the targetDate,
      // ignore the entire staple because all blocks in a staple are processed
      // as an atomic transaction by the representatives which create the votes.
      const isBeforeTargetDate = voteStaple.votes.find(vote => {
        const voteDate = new Date(vote.validityFrom);
        return voteDate < targetDate;
      });
      if (isBeforeTargetDate) {
        timestampReached = true;
        break;
      }

      for (const block of voteStaple.blocks) {
        for (const operation of block.operations) {
          // SEND operation
          if (operation.type === 0 && balanceChanges.has(operation.token)) {
            // If the block is issued from the target account, the KTA was sent to someone else.
            if (block.account === account) {
              balanceChanges.set(
                operation.token,
                balanceChanges.get(operation.token) - BigInt(operation.amount),
              );
            }

            // The balance was sent to us
            if (operation.to === account) {
              balanceChanges.set(
                operation.token,
                balanceChanges.get(operation.token) + BigInt(operation.amount),
              );
            }
          }

          // RECEIVE operation
          // These are RECEIVE's where the recipient forwards the received tokens to the forward account.
          // There's no separate SEND operation for that, so we'll have to handle the RECEIVEs separately.
          if (operation.type === 7 && balanceChanges.has(operation.token) && operation.forward === account) {
            let receivedBalance = 0n;

            if (operation.exact) {
              receivedBalance = BigInt(operation.amount);
            } else {
              // For non-exact forward RECEIVEs we have to check the previous blocks in the staple to find out how much
              // has been sent to the account.
              for (const stapleBlock of voteStaple.blocks) {
                // SEND operations must happen before the RECEIVE operation, so stop once we reached our block
                if (stapleBlock.$hash === block.$hash) {
                  break;
                }

                // The SEND operations must originate from the account specified in the RECEIVE operation
                if (stapleBlock.account !== operation.from) {
                  continue;
                }

                // Find any SEND operations that match the token and recipient
                for (const stapleOperation of stapleBlock.operations) {
                  if (stapleOperation.type === 0 && stapleOperation.token === operation.token && stapleOperation.to === block.account) {
                    receivedBalance += BigInt(stapleOperation.amount);
                  }
                }
              }
            }

            balanceChanges.set(
              operation.token,
              balanceChanges.get(operation.token) + receivedBalance,
            );
          }
        }
      }
    }

    if (!history.nextKey) {
      break;
    }

    start = history.nextKey;
  }

  return balanceChanges;
}

/**
 * Gets the token balances of an address at the given timestamp on the Keeta mainnet.
 *
 * @param {string} address - Address of the account
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {string[]} tokens - The tokens to get the balances for
 * @returns {Promise<Map<string, BigInt>>} Token balances of the account as a BigInt
 */
async function getTokenBalances(address, timestamp, tokens) {
  const { currentHeadBlock, balances } = await getAccountInfo(address);

  const tokenBalances = new Map();
  for (const token of tokens) {
    tokenBalances.set(token, 0n);
  }

  for (const balance of balances) {
    if (tokenBalances.has(balance.token)) {
      tokenBalances.set(
        balance.token,
        tokenBalances.get(balance.token) + BigInt(balance.balance),
      );
    }
  }

  if (timestamp < (Date.now() / 1000) - 4 * 60 * 60) {  // If the timestamp is more than 4 hours in the past

  const balanceChanges = await tokenBalanceChangesAfter(address, new Date(timestamp * 1000), tokens, currentHeadBlock);

  for (const [token, balanceChange] of balanceChanges) {
    tokenBalances.set(
      token,
      tokenBalances.get(token) - balanceChange,
    );
  }

  }
  return tokenBalances;
}

module.exports = {
  getTokenBalances,
};
