const sdk = require("@defillama/sdk");

const { getCache, setCache } = require("../helper/cache");
const { setCallCache } = require("./cache");
const { automationV1Tvl, getAutomationV1Data } = require("./automation-v1");
const { automationV2Tvl, getAutomationV2Data } = require("./automation-v2");

async function getAutomationTvl(api) {
  await api.getBlock();
  const executionStart = Date.now() / 1000;
  const [automationV1Data, automationV2Data, cache] = await Promise.all([
    getAutomationV1Data({ api }),
    getAutomationV2Data({ api }),
    getCache("summer-fi/cache", api.chain),
  ]);

  setCallCache(cache);

  await Promise.all([
    automationV1Tvl({ api, automationV1Data }),
    automationV2Tvl({ api, automationV2Data }),
  ]);

  await setCache("summer-fi/cache", api.chain, cache);
  sdk.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}

module.exports = {
  doublecounted: true,
  methodology:
    "Summer.fi Pro TVL is calculated by fetching onchain data, retrieving Vault IDs, and using them to determine locked collateral authorised for use within the Summer Automation contracts.",
  ethereum: { tvl: getAutomationTvl },
  base: { tvl: getAutomationTvl },
  arbitrum: { tvl: getAutomationTvl },
  optimism: { tvl: getAutomationTvl },
};
