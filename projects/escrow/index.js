const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0x2a412Df7e18B847e953c2Bc6ae90581dEe8571e3";

async function tvl(time, ethBlock, _b, { api }) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api });
}

module.exports = {
  methodology: `We count the eth on ${contract}`,
  eth: {
    tvl,
    volume,
  },
};
