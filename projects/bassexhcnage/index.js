const { staking } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs')

const asssets = "0xb11f5E642EF4cF963e45A83E55A8fedCd58F9A9c"

async function tvl(timestamp, ethereumBlock, chainBlocks, { api }) {
  const tokensAndOwners  = await api.call({
    target: asssets,
    abi: "function getAssets() view returns (address[][])",
  })
  return sumTokens2({ api, tokensAndOwners, })
}

module.exports = {
  base: {
    tvl,
  },
};
