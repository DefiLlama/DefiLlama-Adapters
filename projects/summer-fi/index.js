const { automationTvl, dpmPositions, makerTvl } = require("./handlers");
const { getAutomationCdpIdList } = require("./helpers");
const sdk = require('@defillama/sdk')
const { getConfig } = require("../helper/cache");
const { endpoints } = require("./constants/endpoints");

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};

async function tvl(
  timestamp,
  block,
  { ethereum: ethereumBlockHeight }, // not used, but included for clarity
  { api }
) {
  await api.getBlock()
  const executionStart = Date.now() / 1000;
  const confirmedSummerFiMakerVaults = await getConfig('summer-fi/maker-vaults', endpoints.makerVaults)
  const cdpIdList = await getAutomationCdpIdList({ api });

  sdk.log([...cdpIdList].length, 'cdpIdList')
  
  await Promise.all([
    dpmPositions({ api }),
    automationTvl({ api, cdpIdList }),
    makerTvl({ api, cdpIdList, confirmedSummerFiMakerVaults, }),
  ]);

  sdk.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}
