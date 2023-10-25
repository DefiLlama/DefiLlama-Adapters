const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0xDe67d94C349960cF80625Bfe762aAe9428844763";

async function tvl(time, ethBlock, _b, { api }) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api });
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl,
  },
};
