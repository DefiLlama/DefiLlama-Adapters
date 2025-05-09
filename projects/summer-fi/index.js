const { automationTvl, aaveV3Tvl, ajnaTvl, morphoBlueTvl, makerTvl } = require("./handlers");
const { getAutomationCdpIdList, setCallCache } = require("./helpers");
const sdk = require("@defillama/sdk");
const { getCache, setCache } = require("../helper/cache");

module.exports = {
  doublecounted: true,
  methodology: "Summer.fi PRO TVL is calculated by fetching on-chain data, retrieving CDP IDs, and using them to determine locked assets via the automationTvl function, excluding frontend-managed Maker vaults",
  tvl,
  ethereum: { tvl: ethereumTvl },
  base: { tvl: baseTvl },
  arbitrum: { tvl: arbitrumTvl },
  optimism: { tvl: optimismTvl },
};

async function tvl(api) {
  const chainTvls = await Promise.all([
    ethereumTvl(api),
    baseTvl(api),
    arbitrumTvl(api),
    optimismTvl(api),
  ]);
  return chainTvls.reduce((acc, curr) => acc + curr, 0);
}

async function ethereumTvl(api) {
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
    aaveV3Tvl({ api, chain: 'ethereum' }),
    ajnaTvl({ api, chain: 'ethereum' }),
    morphoBlueTvl({ api, chain: 'ethereum' }),
    makerTvl({ api, cdpIdList }),
  ]);

  await setCache("summer-fi/cache", api.chain, cache);
  sdk.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}

async function baseTvl(api) {
  await api.getBlock();
  const executionStart = Date.now() / 1000;
  const cache = await getCache("summer-fi/cache", api.chain);
  setCallCache(cache);

  await Promise.all([
    aaveV3Tvl({ api, chain: 'base' }),
    ajnaTvl({ api, chain: 'base' }),
    morphoBlueTvl({ api, chain: 'base' }),
  ]);

  await setCache("summer-fi/cache", api.chain, cache);
  sdk.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}

async function arbitrumTvl(api) {
  await api.getBlock();
  const executionStart = Date.now() / 1000;
  const cache = await getCache("summer-fi/cache", api.chain);
  setCallCache(cache);

  await Promise.all([
    aaveV3Tvl({ api, chain: 'arbitrum' }),
    ajnaTvl({ api, chain: 'arbitrum' }),
  ]);

  await setCache("summer-fi/cache", api.chain, cache);
  sdk.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}

async function optimismTvl(api) {
  await api.getBlock();
  const executionStart = Date.now() / 1000;
  const cache = await getCache("summer-fi/cache", api.chain);
  setCallCache(cache);

  await Promise.all([
    aaveV3Tvl({ api, chain: 'optimism' }),
    ajnaTvl({ api, chain: 'optimism' }),
  ]);

  await setCache("summer-fi/cache", api.chain, cache);
  sdk.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}
