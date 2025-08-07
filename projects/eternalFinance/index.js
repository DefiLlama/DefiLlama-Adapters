const { lyfTvl } = require("./lyf");
const { lendingTvl } = require("./lending");

async function tvl(api) {
  await lyfTvl(api);
  await lendingTvl(api);
}

module.exports = {
  timetravel: false,
  aptos: {
    tvl,
  }
}