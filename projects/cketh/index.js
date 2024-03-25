const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0xb25eA1D493B49a1DeD42aC5B1208cC618f9A9B80";

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api });
}

module.exports = {
  methodology: `We count the ETH on ${contract} as the collateral for the ckETH`,
  ethereum: {
    tvl,
  },
};