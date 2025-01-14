const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0xeFb73Ae2247d8a5A87D1EF5e9FD0b815BAb262ef";

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api });
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl,
  },
};
