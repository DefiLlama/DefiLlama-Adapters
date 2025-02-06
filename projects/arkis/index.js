const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs")

const infoAbi = require("./agreementAbi.json");
const config = require("./config.json");


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

  try {
    const logs = await getLogs({
      api: api,
      target: config.chains[chain].factory[factoryType],
      topic: topic,
      eventAbi: eventAbi,
      onlyArgs: true,
      fromBlock: config.chains[chain].startBlock,
    });

    return logs.map((log) => log[0]);
  } catch (error) {
    console.error(`Failed to fetch logs on ${chain} for ${factoryType}:`, error);
    return [];
  }
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

  for (const agreementAddress of agreementAddresses) {
    try {
      const { metadata, whitelist } = await api.call({
        abi: infoAbi,
        target: agreementAddress,
      });

      if (metadata.leverage === config.zeroAddress) {
        console.warn(`Skipping Agreement ${agreementAddress} - No valid leverage found`);
        continue;
      }

      tokenSet.add(metadata.leverage);
      metadata.collaterals.forEach((collateral) => tokenSet.add(collateral));
      whitelist.tokens.forEach((token) => tokenSet.add(token));
    } catch (error) {
      console.error(`Failed to fetch data on ${chain} for Agreement ${agreementAddress}:`, error);
    }
  }
  if(tokenSet.has(config.chains[chain].nativeToken)) {
    tokenSet.delete(config.ethAddress);
    tokenSet.add(config.zeroAddress)
  }

  return Array.from(tokenSet);
}


module.exports = {
  methodology:
    "TVL is calculated by summing the balances of leverage assets, collaterals, and whitelisted tokens held in agreements and margin accounts deployed by factory contracts. Native tokens and LP tokens are also included.",
};

Object.keys(config.chains).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const agreements = await fetchFactoryLogs(
        api,
        chain,
        "agreement"
      );
      const marginAccounts = await fetchFactoryLogs(
        api,
        chain,
        "marginAccount"
      );
      const owners = [...agreements, ...marginAccounts];
      const tokens = await getTokens(api, chain, agreements);

      return sumTokens2({api, chain, owners, tokens, resolveLP: true, unwrapAll: true});
    }
  }
})
