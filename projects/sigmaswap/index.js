const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0xE58a7D7E726CD266c103cC7C2763f4a3005d78B1";

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api });
}

module.exports = {
  methodology: `We count the LYX on ${contract}`,
  lukso: {
    tvl,
  },
};
