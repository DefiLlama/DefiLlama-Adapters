const { sumTokens2 } = require("../helper/unwrapLPs");

const tokenDict = {
  "0x62Ba5e1AB1fa304687f132f67E35bFC5247166aD": [
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
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
