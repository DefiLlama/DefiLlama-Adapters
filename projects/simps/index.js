const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0x2a7868fd6f3501841d6dab7f4be8a3f8d463b842";

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api });
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl,
  },
};
