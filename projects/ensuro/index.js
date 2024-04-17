const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const addressBook = {
  polygon: {
    usdc: ADDRESSES.polygon.USDC,
    aave_v3_usdc: "0x625E7708f30cA75bfd92586e17077590C60eb4cD",  // aPolUSDC
    aave_v2_usdc: "0x1a13F4Ca1d028320A707D99520AbFefca3998b7F",  // amUSDC
    reserves: [
      // eTokens
      {name: "eToken Junior Koala", address: "0x8d2Ee82c4172B2138B06b8037d769cBfAf9C0274"},
      {name: "eToken Senior", address: "0x55bAe6690d46EA94D7F05DF7c80A85E322421fB6"},
      {name: "eToken Innov Zone", address: "0x1C48Accaf6f8106883AA1973A45F02525652DEfC"},
      {name: "eToken Junior Koala BMA", address: "0xBC33c283A37d46ABA17BC5F8C27b27242688DeC6"},
      {name: "eToken Senior BMA", address: "0xF383eF2D31E1d4a19B3e04ca2937DB6A8DA9f229"},
      {name: "eToken Junior Spot", address: "0x6229D78658305a301E177f9dAEa3a0799fd1528C"},
      {name: "eToken Junior Revo", address: "0x6A0e61C757e384eB1E4A2b94F7E02E68e4b4515e"},
      {name: "eToken Junior StormStrong", address: "0xE36D6585F0c200195b196C66644C519e7674b476"},
      {name: "eToken Junior Barker", address: "0x9F967c614c9573cc4eabE68ae0354E5d11F7eC9D"},
      {name: "eToken Junior DLT", address: "0x9078dDdeA2F82c27791EF78A9ec9ab0f66bfb6F9"},
      {name: "eToken Junior Otonomi", address: "0x32a9CBeb2cA148E55F327c6B4673351dD03eD858"},
      {name: "eToken Junior Bliss", address: "0x71d390C243706b713B5D2b077E942223f7A55d00"},
      // PremiumsAccounts
      {name: "PremiumsAccount Koala", address: "0xCCf5C404d32eB6E777088AB13837a1b8dCBA9328"},
      {name: "PremiumsAccount Innov Zone", address: "0x4f43B8F252887F814ED689346fdb5Bd266394520"},
      {name: "PremiumsAccount Koala BMA", address: "0xc1A74eaC52a195E54E0cd672A9dAB023292C6100"},
      {name: "PremiumsAccount StormStrong", address: "0x06347eA3dA6a5B44eEAe3B8F4a65992Ae073e6F4"},
      {name: "PremiumsAccount Revo", address: "0x47f35B4876138b5d96FfDed1e46aE6b58E6e7B31"},
      {name: "PremiumsAccount Spot", address: "0x42118Df6EBb18346ca425f1c67AC739E95aD9358"},
      {name: "PremiumsAccount Barker", address: "0xa5A8c6b6cb08dB75F5d487F0838D0743871d80a7"},
      {name: "PremiumsAccount DLT", address: "0x8908d99a4E2fF6b7Bf4563593B02AcBc7bBfaBC1"},
      {name: "PremiumsAccount Otonomi", address: "0xE43587386E6e8FA127dd008770cdC07dE2Df91E9"},
      {name: "PremiumsAccount Bliss", address: "0x11b490292799a0edFE37797592F77151C4483442"},
    ],
  }
};

async function tvl(api) {
  const addresses = addressBook[api.chain];
  const ownerTokens = addresses.reserves.map(i => [[addresses.usdc, addresses.aave_v3_usdc], i.address])

  return sumTokens2({ api, ownerTokens, });
}

module.exports = {
  methodology: `Sums the USDC amounts (both liquid and invested in AAVE) of the different protocol reserves (https://docs.ensuro.co/product-docs/smart-contracts/reserves).`,
  polygon: {
    tvl
  },
  start: 1643673600,
  hallmarks: [
    [1669852800, "Ensuro V2 Launch"]
  ]
};
