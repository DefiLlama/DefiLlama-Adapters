const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const tokenDict = {
  "0x62Ba5e1AB1fa304687f132f67E35bFC5247166aD": [
    ADDRESSES.polygon.USDC,
    ADDRESSES.polygon.USDT,
    ADDRESSES.polygon.DAI,
  ],
};

async function getTotalAssets(pool, api) {
  const tokens = tokenDict[pool];
  const owners = await api.multiCall({
    abi: "function tokenLPs(address) view returns (address)",
    calls: tokens,
    target: pool,
  });
  return tokens.map((val, i) => [val, owners[i]]);
}

async function tvl(timestamp, ethereumBlock, chainBlocks, { api }) {
  const totalAssets = (
    await Promise.all(Object.keys(tokenDict).map((i) => getTotalAssets(i, api)))
  ).flat();
  return sumTokens2({ api, tokensAndOwners: totalAssets });
}

module.exports = {
  polygon: {
    tvl,
  },
};
