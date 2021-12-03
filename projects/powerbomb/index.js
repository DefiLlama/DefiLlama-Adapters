const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const powerbombAvaxCurveBTCAddr = "0x2510E5054eeEbED40C3C580ae3241F5457b630D9";
const powerbombAvaxCurveETHAddr = "0xFAcB839BF8f09f2e7B4b6C83349B5bbFD62fd659";
const powerbombAvaxCurveWsOHMAddr =
  "0x4d3e58DAa8233Cc6a46b9c6e23df5A202B178550";
const powerbombAvaxCurveMEMOAddr = "0xB523b02556cFeEE0417222f696d9aee0deAd49bf";

async function fetch() {
  const btcTVL =
    Number(
      (
        await sdk.api.abi.call({
          chain: "avax",
          target: powerbombAvaxCurveBTCAddr,
          abi: abi["getAllPoolInUSD"],
        })
      ).output
    ) / 1000000;

  const ethTVL =
    Number(
      (
        await sdk.api.abi.call({
          chain: "avax",
          target: powerbombAvaxCurveETHAddr,
          abi: abi["getAllPoolInUSD"],
        })
      ).output
    ) / 1000000;

  const wsohmTVL =
    Number(
      (
        await sdk.api.abi.call({
          chain: "avax",
          target: powerbombAvaxCurveWsOHMAddr,
          abi: abi["getAllPoolInUSD"],
        })
      ).output
    ) / 1000000;

  const memoTVL =
    Number(
      (
        await sdk.api.abi.call({
          chain: "avax",
          target: powerbombAvaxCurveMEMOAddr,
          abi: abi["getAllPoolInUSD"],
        })
      ).output
    ) / 1000000;

  return btcTVL + ethTVL + wsohmTVL + memoTVL;
}

module.exports = {
  avalanche: {
    fetch,
  },
  fetch,
};
