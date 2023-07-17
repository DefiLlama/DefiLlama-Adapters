const { automationTvl, dpmPositions, makerTvl } = require("./handlers");
const { getAutomationCdpIdList } = require("./helpers");

module.exports = {
  ethereum: {
    tvl,
  },
};

async function tvl(
  timestamp,
  _block,
  { ethereum: ethereumBlockHeight }, // not used, but included for clarity
  { api }
) {
  const executionStart = Date.now() / 1000;
  const cdpIdList = await getAutomationCdpIdList({ api });
  await Promise.all([
    dpmPositions({ api }),
    automationTvl({ api, cdpIdList }),
    // makerTvl({ api, cdpIdList }), // this will be used once we get the maker positions list
  ]);
  console.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}
