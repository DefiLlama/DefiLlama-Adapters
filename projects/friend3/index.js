const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

const contract = "0x1e70972EC6c8a3FAe3aC34C9F3818eC46Eb3BD5D";

async function tvl(time, ethBlock, _b, { api }) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api });
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  bsc: {
    tvl,
  },
};
