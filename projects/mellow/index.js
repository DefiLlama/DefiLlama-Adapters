const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0x0c884b56fa7dd33a1f4e8b05e7105217c2456219";

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api });
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl,
  },
};
