const { sumTokens2 } = require('../helper/unwrapLPs');

const CONTRACTS = {
  V1: "0x6582730C6b5366144c43dcBEfDf4a56e120967D5"
};

const WLD = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";

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
    "TVL is calculated by sum of WLD tokens held on Z3Z contract.",
  wc: {
    tvl,
  },
};