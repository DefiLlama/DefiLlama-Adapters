const { dpmPositions, makerTvl } = require("./handlers");
const { getAutomationCdpIdList, setCallCache } = require("./helpers");
const sdk = require("@defillama/sdk");
const { getConfig, getCache, setCache } = require("../helper/cache");
const { endpoints } = require("./constants/endpoints");

async function tvlEthereum(api) {
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
    makerTvl({ api, cdpIdList, confirmedSummerFiMakerVaults }),
  ]);

  await setCache("summer-fi/cache", api.chain, cache);
  sdk.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}


module.exports = {
  doublecounted: true,
  methodology: "Summer.fi PRO TVL is calculated by fetching on-chain data, retrieving CDP IDs, and using them to determine locked assets via the automationTvl function, excluding frontend-managed Maker vaults",
  ethereum: { tvl: tvlEthereum },
};