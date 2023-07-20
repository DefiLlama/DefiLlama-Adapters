const { automationTvl, dpmPositions, makerTvl } = require("./handlers");
const { getAutomationCdpIdList } = require("./helpers");

module.exports = {
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
  const executionStart = Date.now() / 1000;
  const cdpIdList = await getAutomationCdpIdList({ api, block });
  await Promise.all([
    dpmPositions({ api }),
    automationTvl({ api, cdpIdList }),
    makerTvl({ api, cdpIdList, block }),
  ]);
  console.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}
