const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0xFD2023a463Ff177dA35e3C8128bf7E51a6e439DB";

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api });
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  era: {
    tvl,
  },
};
