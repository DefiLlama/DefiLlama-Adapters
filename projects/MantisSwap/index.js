const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const polygonTokenDict = {
  "0x62Ba5e1AB1fa304687f132f67E35bFC5247166aD": [
    ADDRESSES.polygon.USDC,
    ADDRESSES.polygon.USDT,
    ADDRESSES.polygon.DAI,
  ],
};

const zkevmTokenDict = {
  "0x12d41b6DF938C739F00c392575e3FD9292d98215": [
    ADDRESSES.polygon_zkevm.USDC,
    "0x1E4a5963aBFD975d8c9021ce480b42188849D41d", // USDT
    "0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4", // DAI
  ],
};

async function getTotalAssets(pool, api, chain) {
  let tokens = [];
  if (chain == "polygon") {
    tokens = polygonTokenDict[pool];
  } else if (chain == "polygon_zkevm") {
    tokens = zkevmTokenDict[pool];
  }
  const owners = await api.multiCall({
    abi: "function tokenLPs(address) view returns (address)",
    calls: tokens,
    target: pool,
  });
  return tokens.map((val, i) => [val, owners[i]]);
}

async function polygonTvl(timestamp, ethereumBlock, chainBlocks, { api }) {
  const totalAssets = (
    await Promise.all(
      Object.keys(polygonTokenDict).map((i) =>
        getTotalAssets(i, api, "polygon")
      )
    )
  ).flat();
  return sumTokens2({ api, tokensAndOwners: totalAssets });
}

async function zkevmTvl(timestamp, ethereumBlock, chainBlocks, { api }) {
  const totalAssets = (
    await Promise.all(
      Object.keys(zkevmTokenDict).map((i) =>
        getTotalAssets(i, api, "polygon_zkevm")
      )
    )
  ).flat();
  return sumTokens2({ api, tokensAndOwners: totalAssets });
}

module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
  polygon_zkevm: {
    tvl: zkevmTvl,
  },
};
