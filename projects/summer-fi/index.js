const { automationTvl } = require("./automation-v1");
const { dpmPositions } = require("./dpm-positions");

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
  await Promise.all([automationTvl({ api }), dpmPositions({ api })]);
  console.log("Execution time", Date.now() / 1000 - executionStart, "seconds");
}
