const utils = require("../helper/utils");
const sdk = require("@defillama/sdk");

async function tvl(timestamp) {
  let balances = {};
  let url = `https://api2.kava.io/kava/savings/v1beta1/total_supply`;

  // if (Math.abs(Date.now() / 1000 - timestamp) > 3600) {
  //   const block = await sdk.api.util.lookupBlock(timestamp, { chain: "kava" });
  //   url += `?height=${block.block}`;
  // }

  const response = await utils.fetchURL(url);

  for (let coin of response.data.result) {
    const tokenInfo = generic(coin.denom);
    if (!tokenInfo) {
      console.log("unknown token", coin.denom);
      continue;
    }
    const tokenName = tokenInfo[0];
    if (tokenName !== 'kava')
      sdk.util.sumSingleBalance(balances,tokenName,coin.amount / 10 ** tokenInfo[1])
  }

  return balances;
}

function generic(ticker) {
  switch (ticker) {
    case "bkava":
      return ["kava", 6];
    case "ukava":
      return ["kava", 6];
    case "erc20/multichain/usdc":
      return ["usd-coin", 6];
  }
}

module.exports = {
  timetravel: false,
  kava: { tvl }
};
