const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const powerbombAvaxCurveBTCAddr = "0x2510E5054eeEbED40C3C580ae3241F5457b630D9";
const powerbombAvaxCurveETHAddr = "0xFAcB839BF8f09f2e7B4b6C83349B5bbFD62fd659";
const powerbombAvaxCurveWsOHMAddr =
  "0x4d3e58DAa8233Cc6a46b9c6e23df5A202B178550";
const powerbombAvaxCurveWMEMOAddr =
  "0x9adA6069D6C02c839111e8F406270ED03D1a9506";
const powerbombAvaxAncBTCAddr = "0x1968dd1ab79c7c73FAc8578FED92DE959d71A65f";
const powerbombAvaxAncETHAddr = "0x7065FdCcE753f4fCEeEcFe25F2B7c51d52cf056e";
const powerbombAvaxAncSAVAXAddr = "0x1c3b1069E60F9e3CE8212410b734a7C6775D865C";
const powerbombAvaxAncGOHMAddr = "0x9838e8E72B4225a9966Ea78A47F297Aa9d7973B0";

async function fetch() {
  const curveBtcTVL =
    Number(
      (
        await sdk.api.abi.call({
          chain: "avax",
          target: powerbombAvaxCurveBTCAddr,
          abi: abi["getAllPoolInUSD"],
        })
      ).output
    ) / 1000000;

  const curveEthTVL =
    Number(
      (
        await sdk.api.abi.call({
          chain: "avax",
          target: powerbombAvaxCurveETHAddr,
          abi: abi["getAllPoolInUSD"],
        })
      ).output
    ) / 1000000;

  const curveWsohmTVL =
    Number(
      (
        await sdk.api.abi.call({
          chain: "avax",
          target: powerbombAvaxCurveWsOHMAddr,
          abi: abi["getAllPoolInUSD"],
        })
      ).output
    ) / 1000000;

  const curveWmemoTVL =
    Number(
      (
        await sdk.api.abi.call({
          chain: "avax",
          target: powerbombAvaxCurveWMEMOAddr,
          abi: abi["getAllPoolInUSD"],
        })
      ).output
    ) / 1000000;

  const ancBtcTVL =
    Number(
      (
        await sdk.api.abi.call({
          chain: "avax",
          target: powerbombAvaxAncBTCAddr,
          abi: abi["getAllPoolInUSD"],
        })
      ).output
    ) / 1000000;

  const ancEthTVL =
    Number(
      (
        await sdk.api.abi.call({
          chain: "avax",
          target: powerbombAvaxAncETHAddr,
          abi: abi["getAllPoolInUSD"],
        })
      ).output
    ) / 1000000;

  const ancSavaxTVL =
    Number(
      (
        await sdk.api.abi.call({
          chain: "avax",
          target: powerbombAvaxAncSAVAXAddr,
          abi: abi["getAllPoolInUSD"],
        })
      ).output
    ) / 1000000;

  const ancGohmTVL =
    Number(
      (
        await sdk.api.abi.call({
          chain: "avax",
          target: powerbombAvaxAncGOHMAddr,
          abi: abi["getAllPoolInUSD"],
        })
      ).output
    ) / 1000000;

  return (
    curveBtcTVL +
    curveEthTVL +
    curveWsohmTVL +
    curveWmemoTVL +
    ancBtcTVL +
    ancEthTVL +
    ancSavaxTVL +
    ancGohmTVL
  );
}

module.exports = {
  methodology: `
    Curve: Balance of av3CRV-gauge in contract multiple by virtual price of corresponding Curve pool, 
    Anchor: Balance of aUST in contract multiple by aUST rate
  `,
  avalanche: {
    fetch,
  },
  fetch,
};
