const utils = require("../helper/utils");
// const sdk = require("@defillama/sdk");

async function tvl(timestamp) {
  let totalValueLocked = {};
  let url = `https://api2.kava.io/kava/liquid/v1beta1/total_supply`;
  // if (Math.abs(Date.now() / 1000 - timestamp) > 3600) {
  //   const block = await sdk.api.util.lookupBlock(timestamp, { chain: "kava" });
  //   url += `?height=${block.block}`;
  // }

  const response = await utils.fetchURL(url);

  for (let coin of response.data.result) {
    const tokenInfo = generic(coin.denom);
    if (!tokenInfo) {
      utils.log("unknown token", coin.denom);
      continue;
    }

    totalValueLocked[tokenInfo[0]] = coin.amount / 10 ** tokenInfo[1];
  }
  return totalValueLocked;
}


function generic(ticker) {
  switch (ticker) {
    case "ukava":
      return ["kava", 6];
  }
}


module.exports = {
  timetravel: false,
  kava: { tvl }
};
