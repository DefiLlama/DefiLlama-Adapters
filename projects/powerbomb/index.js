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

async function tvl(_, _B, { avax: block}) {
  let total = 0
  const owners = [
    powerbombAvaxCurveBTCAddr,
    powerbombAvaxCurveETHAddr,
    powerbombAvaxCurveWsOHMAddr,
    powerbombAvaxCurveWMEMOAddr,
    // powerbombAvaxAncBTCAddr,
    // powerbombAvaxAncETHAddr,
    // powerbombAvaxAncSAVAXAddr,
    // powerbombAvaxAncGOHMAddr,
  ]

  const { output } = await sdk.api.abi.multiCall({
    abi: abi["getAllPoolInUSD"],
    calls: owners.map(i => ({ target: i})),
    chain: 'avax', block,
  })

  output.forEach(i => total += +i.output)

  return {
    tether: total / 1e6
  }
}

module.exports = {
  methodology: `
    Curve: Balance of av3CRV-gauge in contract multiple by virtual price of corresponding Curve pool, 
    Anchor: Balance of aUST in contract multiple by aUST rate
  `,
  avax: {
    tvl,
  },
};
