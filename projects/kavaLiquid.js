const utils = require("./helper/utils");
const sdk = require("@defillama/sdk");

async function tvl(timestamp) {
  let totalValueLocked = {};
  let url = `https://api2.kava.io/swap/pools`;
  if (Math.abs(Date.now() / 1000 - timestamp) > 3600) {
    const block = await sdk.api.util.lookupBlock(timestamp, { chain: "kava" });
    url += `?height=${block.block}`;
  }

  const tokenInfo = ['kava',6]

  // const response = await utils.fetchURL(url);
  //
  // if (response) {
    totalValueLocked[tokenInfo[0]] = 100
  // }

  return totalValueLocked;
}

module.exports = {
  timetravel: false,
  kava: { tvl }
};
