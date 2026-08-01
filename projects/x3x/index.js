const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');

const CONTRACTS = {
  V1: "0x1FD5Bb99b8469916e1D2a65e186b7b30b2C6021A",
  V2: "0x68f571e43C8d96e40c2DAdb69f4a13749D563095",
};

const WLD = ADDRESSES.wc.WLD;

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [WLD, CONTRACTS.V1],
      [WLD, CONTRACTS.V2],
    ],
    useDefaultCoreAssets: true,
  });
}

module.exports = {
  methodology:
    "TVL is calculated by sum of WLD tokens held across all X3X contracts (v1, v2).",
  wc: {
    tvl,
  },
};