const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs")

const agreementAbi = require("./agreementAbi.json");
const config = require("./config.json");

let agreementsCached;
/**
 * Fetches logs from a factory contract on a specified blockchain.
 *
 * @param {Object} api - The API instance to interact with the blockchain.
 * @param {string} chain - The name of the blockchain to fetch logs from.
 * @param {string} factoryType - The type of factory to fetch logs for. Can be "agreement" or "account".
 * @returns {Promise<Array<string>>} - A promise that resolves to an array of log addresses.
 */
async function fetchFactoryLogs(api, chain, factoryType) {
  const topic = factoryType === "agreement" ? "AgreementCreated(address)" : "AccountDeployed(address)";
  const eventAbi = factoryType === "agreement" ? "event AgreementCreated(address agreement)" : "event AccountDeployed(address indexed account)";

  const logs = await getLogs({
    api: api,
    target: config.chains[chain].factory[factoryType],
    topic: topic,
    eventAbi: eventAbi,
    onlyArgs: true,
    fromBlock: config.chains[chain].startBlock,
  });

  return logs.map((log) => log[0]);
}


/**
 * Fetch unique tokens array (leverage, collaterals, whitelisted tokens) from agreements.
 * @param {object} api - The API object for blockchain interaction.
 * @param {string} chain - The name of the blockchain to fetch logs from.
 * @param {string[]} agreementAddresses - An array of agreement addresses.
 * @returns {Promise<string[]>} - An array of unique token addresses.
 */
async function getTokens(api, chain, agreementAddresses) {
  const tokenSet = new Set();

  const results = await api.multiCall({
    abi: agreementAbi[0],
    calls: agreementAddresses,
  });
  
  results.forEach((result, i) => {
    if (result.metadata.leverage === config.zeroAddress) {
      console.warn(`Skipping Agreement ${agreementAddresses[i]} - No valid leverage found`);
      return;
    }
    tokenSet.add(result.metadata.leverage);
    result.metadata.collaterals.forEach((collateral) => tokenSet.add(collateral));
    result.whitelist.tokens.forEach((token) => tokenSet.add(token));
  });
  
  if(tokenSet.has(config.chains[chain].nativeToken)) {
    tokenSet.delete(config.chains[chain].nativeToken);
    tokenSet.add(config.zeroAddress)
  }

  return Array.from(tokenSet);
}

async function borrowed(api, chain, agreementAddresses) {
  const tokenBorrowedMap = new Map();

  const block = await api.getBlock();
  
  // Create parallel call batches with state lock
  const [resultsInfo, resultsTotalBorrowed] = await Promise.all([
    Promise.all(agreementAddresses.map(address => 
      api.call({
        abi: agreementAbi[0],
        target: address,
        block,
      })
    )),
    Promise.all(agreementAddresses.map(address => 
      api.call({
        abi: agreementAbi[1],
        target: address,
        block,
      })
    ))
  ]);

  if (resultsInfo.length !== resultsTotalBorrowed.length) {
    throw new Error('Data misalignment detected');
  }

  resultsInfo.forEach((resultInfo, i) => {
    if (resultInfo.metadata.leverage === config.zeroAddress) {
      console.warn(`Skipping Agreement ${agreementAddresses[i]} - No valid leverage found`);
      return;
    }
    const key = `${chain}:${resultInfo.metadata.leverage}`;
    const borrowedAmount = Number(resultsTotalBorrowed[i]) || 0;
    tokenBorrowedMap.set(key, 
      (tokenBorrowedMap.get(key) || 0) + borrowedAmount
    );
  });

  return Object.fromEntries(tokenBorrowedMap);
}


module.exports = {
  methodology:
    "TVL is calculated by summing the balances of leverage assets, collaterals, and whitelisted tokens held in agreements and margin accounts deployed by factory contracts. Native tokens and LP tokens are also included.",
};

Object.keys(config.chains).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      if (agreementsCached === undefined) agreementsCached = await fetchFactoryLogs(
        api,
        chain,
        "agreement"
      );
      const marginAccounts = await fetchFactoryLogs(
        api,
        chain,
        "marginAccount"
      );
      const owners = [...agreementsCached, ...marginAccounts];
      const tokens = await getTokens(api, chain, agreementsCached);

      return sumTokens2({api, chain, owners, tokens, resolveLP: true, unwrapAll: true});
    },
    borrowed: async(api) => {
      if (agreementsCached === undefined) agreementsCached = await fetchFactoryLogs(
        api,
        chain,
        "agreement"
      );
      return borrowed(api, chain, agreementsCached)
    }
  }
})
