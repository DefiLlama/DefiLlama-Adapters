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
      // PremiumsAccounts
      {name: "PremiumsAccount Koala", address: "0xCCf5C404d32eB6E777088AB13837a1b8dCBA9328"},
      {name: "PremiumsAccount Innov Zone", address: "0x4f43B8F252887F814ED689346fdb5Bd266394520"},
      {name: "PremiumsAccount Koala BMA", address: "0xc1A74eaC52a195E54E0cd672A9dAB023292C6100"},
    ],
    v1: {
      pool: "0xF7ED72430bEA07D8dB6eC264603811381F5af8e0",
      asset_manager: "0x09d9Dd252659a497F3525F257e204E7192beF132",
    }
  }
};

async function tvl(_timestamp, _block, _blocksOthers, { api }) {
  const addresses = addressBook[api.chain];
  const ownerTokens = addresses.reserves.map(i => [[addresses.usdc, addresses.aave_v3_usdc], i.address])

  if (addresses.v1) {
    ownerTokens.push([[addresses.usdc], addresses.v1.pool])
    ownerTokens.push([[addresses.aave_v2_usdc], addresses.v1.asset_manager])
  }
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
