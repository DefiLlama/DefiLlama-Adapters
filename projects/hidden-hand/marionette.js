const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const owners = ["0x60443fd265b4a4D51DFE2569569D45DBde393B14", "0x6045648cF69285fC2018Ca8F3ee8844d5e05Ee5d"]; //marionette adapters

  return sumTokens2({
    api,
    owners,
    solidlyVeNfts: [
      { 
        isAltAbi: true,
        baseToken: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
        veNft: "0xfBBF371C9B0B994EebFcC977CEf603F7f31c070D"
      }, // veTHENA
    ],
    permitFailure: true,
  });
}

module.exports = {
  methodology: `Sums veTokens deposited on Hidden Hand Marionette Adapters.`,
  bsc: { tvl },
};
