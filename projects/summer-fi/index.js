const { automationTvl, dpmPositions, makerTvl } = require("./handlers");
const { getAutomationCdpIdList, setCallCache } = require("./helpers");
const sdk = require("@defillama/sdk");
const { getConfig, getCache, setCache } = require("../helper/cache");
const { endpoints } = require("./constants/endpoints");

module.exports = {
  doublecounted: true,
  ethereum: { tvl },
};

async function tvl(api) {
  await api.getBlock();
  const executionStart = Date.now() / 1000;
  const [confirmedSummerFiMakerVaults, cdpIdList, cache] = await Promise.all([
    await getConfig("summer-fi/maker-vaults", endpoints.makerVaults()),
    getAutomationCdpIdList({ api }),
    getCache("summer-fi/cache", api.chain),
  ]);

  setCallCache(cache);

  sdk.log([...cdpIdList].length, "cdpIdList");

  await Promise.all([
    dpmPositions({ api }),
    automationTvl({ api, cdpIdList }),
    makerTvl({ api, cdpIdList, confirmedSummerFiMakerVaults }),
  ]);

  await setCache("summer-fi/cache", api.chain, cache);
  sdk.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}
