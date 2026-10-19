const { sumTokens2 } = require("../helper/unwrapLPs");

const farmContract = "0x1aF28E7b1A03fA107961897a28449F4F9768ac75";

// getAllFarms() on the farm contract started reverting in mid-2026 (implementation removed);
// the stake tokens below were read from the contract at bsc block 95646252 and are now static
const stakeTokens = [
  "0x04Aa43FEcff86E0BEFD0C89F21fBb1f458c1455b",
  "0xbb69e398c49A353D8359dEa4F750756566C9DFEa",
  "0xC51E41c88E1F7cCC12bc12748Bfd1CF3d0058908",
  "0xDaB0686d5F06dEB4b721baa79dA96E18cF19D029",
];

const bscTvl = async (api) => {
  return sumTokens2({ api, resolveLP: true, owner: farmContract, tokens: stakeTokens })
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  methodology:
    "We count liquidity on the Farms through Farm Contract",
};
