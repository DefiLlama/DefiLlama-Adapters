const { automationTvl } = require("./handlers");
const { getAutomationCdpIdList, setCallCache } = require("./helpers");
const sdk = require("@defillama/sdk");
const { getCache, setCache } = require("../helper/cache");

module.exports = {
  doublecounted: true,
  ethereum: { tvl },
};

async function tvl(api) {
  await api.getBlock();
  const executionStart = Date.now() / 1000;
  const [cdpIdList, cache] = await Promise.all([
    getAutomationCdpIdList({ api }),
    getCache("summer-fi/cache", api.chain),
  ]);

  setCallCache(cache);

  sdk.log([...cdpIdList].length, "cdpIdList");

  await Promise.all([
    automationTvl({ api, cdpIdList }),
  ]);

  await setCache("summer-fi/cache", api.chain, cache);
  sdk.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}
