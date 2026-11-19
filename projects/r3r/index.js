const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');

const CONTRACTS = {
  V1: "0xeDF3e2F4E4816b45c8f540c6Cee62DdA033d7950"
};

const WLD = ADDRESSES.wc.WLD;

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [WLD, CONTRACTS.V1]
    ],
    useDefaultCoreAssets: true,
  });
}

module.exports = {
  methodology:
    "TVL is calculated by sum of WLD tokens held on R3R contract.",
  wc: {
    tvl,
  },
};