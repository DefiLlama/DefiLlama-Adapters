const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0xbC98176DC471CB67Dc19fA4558104f034D8965Fa";

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api });
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl,
  },
};
