const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const calculateLpTokenPrice = require("./calculate-lp-token-price");
const getTokenPrice = require("./get-token-price");
const { getUniTVL } = require("../helper/unknownTokens");

const MASTERCHEF = "0x231A584095dbFb73A0201d6573260Bc646566c98";

async function tvl() {
  let amount = 0;

  const length = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      chain: "arbitrum",
      target: MASTERCHEF,
      params: [],
    })
  ).output;

  const uniwPrice = await getTokenPrice("UNIA");
  for (let i = 0; i < length; i++) {
    const poolInfo = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        chain: "arbitrum",
        target: MASTERCHEF,
        params: [i],
      })
    ).output;

    const token = (
      await sdk.api.abi.call({
        abi: "erc20:symbol",
        chain: "arbitrum",
        target: poolInfo.lpToken,
        params: [],
      })
    ).output;

    const balance = (
      await sdk.api.abi.call({
        abi: abi.lpTokenAmount,
        chain: "arbitrum",
        target: MASTERCHEF,
        params: [i],
      })
    ).output;

    let price = 0;

    if (token === "UNIA") {
      price = await getTokenPrice("UNIA");
    } else if (token === "LP") {
      price = await calculateLpTokenPrice(poolInfo.lpToken, uniwPrice);
    } else {
      price = await getTokenPrice(token);
    }
    amount += (balance / 1e18) * price;
  }

  return amount;
}

module.exports = {
  arbitrum: {
    fetch: tvl,
    tvl: getUniTVL({
      chain: "arbitrum",
      useDefaultCoreAssets: true,
      factory: "0x71539d09d3890195dda87a6198b98b75211b72f3",
    }),
  },
};
