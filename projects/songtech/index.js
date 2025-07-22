const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0xDe67d94C349960cF80625Bfe762aAe9428844763";
const contract2 = "0x3713c98b942B80178985bBbAA61Fc916B4D4D39A"

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress], owners: [contract,contract2], api });
}

module.exports = {
  methodology: `We count the ETH on ${contract} & ${contract2}`,
  base: {
    tvl,
  },
};
