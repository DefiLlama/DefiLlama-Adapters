const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0x76192E7cD69bb6F7992E4d996790942653b9F704";

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api });
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl,
  },
};
