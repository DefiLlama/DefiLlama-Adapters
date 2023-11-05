const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
​
const contractBsc = "0x1e70972EC6c8a3FAe3aC34C9F3818eC46Eb3BD5D";
const contractOpbnb = "0x2C5bF6f0953ffcDE678A35AB7d6CaEBC8B6b29F0";
​
async function tvl(time, ethBlock, _b, { api, chain }) {
  if (chain === "bsc") {
    return sumTokens2({ tokens: [nullAddress], owner: contractBsc, api });
  } else if (chain === "op_bnb") {
    return sumTokens2({
      tokens: [nullAddress],
      owner: contractOpbnb,
      api,
    });
  }
}
​
module.exports = {
  methodology: `We count the BNB on ${contractBsc} ${contractOpbnb}`,
  bsc: {
    tvl,
  },
  op_bnb: {
    tvl,
  },
};
