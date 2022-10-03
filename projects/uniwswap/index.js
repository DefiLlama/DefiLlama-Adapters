const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const calculateLpTokenPrice = require("./calculate-lp-token-price");
const getTokenPrice = require("./get-token-price");

const MASTERCHEF = "0xC07707C7AC7E383CE344C090F915F0a083764C94";

async function tvl() {
  let amount = 0;

  const length = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      chain: "ethpow",
      target: MASTERCHEF,
      params: [],
    })
  ).output;

  const borkPrice = await getTokenPrice("UNIW");
  for (let i = 0; i < length; i++) {
    const poolInfo = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        chain: "ethpow",
        target: MASTERCHEF,
        params: [i],
      })
    ).output;

    const token = (
      await sdk.api.abi.call({
        abi: "erc20:symbol",
        chain: "ethpow",
        target: poolInfo.lpToken,
        params: [],
      })
    ).output;

    const balance = (
      await sdk.api.abi.call({
        abi: abi.lpTokenAmount,
        chain: "ethpow",
        target: MASTERCHEF,
        params: [i],
      })
    ).output;

    let price = 0;

    if (token === "UNIW") {
      price = await getTokenPrice("UNIW");
    } else if (token === "LP") {
      price = await calculateLpTokenPrice(poolInfo.lpToken, borkPrice);
    } else {
      price = await getTokenPrice(token);
    }
    amount += (balance / 1e18) * price;
  }

  return amount;
}

module.exports = {
  fetch: tvl,
};
