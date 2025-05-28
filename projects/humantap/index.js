const { sumTokens2 } = require('../helper/unwrapLPs');

const CONTRACTS = {
  V1: "0xC9f0Cc4e0cbb1143CcBE12Fc59cE5270112d7845",
  V2: "0xF92dEC11Eb85DE7a3E618c4E8e4F79Fc60651Ba8",
  V3: "0x3f117952Bb5FbB19a6aDf4fBDa28F86bC6eD9587",
};

const WLD = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";
const HTAP = "0xab4EAAC9D4DF861C82A0637db86dE45dd562379a";

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      [WLD, CONTRACTS.V1],
      [WLD, CONTRACTS.V2],
      [WLD, CONTRACTS.V3],
      [HTAP, CONTRACTS.V1],
      [HTAP, CONTRACTS.V2],
      [HTAP, CONTRACTS.V3]
    ],
    useDefaultCoreAssets: true,
  });
}

module.exports = {
  methodology:
    "TVL is calculated by summing WLD and HTAP tokens held across all HumanTap contracts (v1, v2, v3).",
  wc: {
    tvl,
  },
};
