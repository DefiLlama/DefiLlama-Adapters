const { sumTokens2 } = require("../helper/unwrapLPs");
const { cachedGraphQuery } = require("../helper/cache");

const MintingHub = "0x7bbe8F18040aF0032f4C2435E7a76db6F1E346DF";
const Collaterals = ["0xb4272071ecadd69d933adcd19ca99fe80664fc08"]; // XCHF
const FPS = "0x1bA26788dfDe592fec8bcB0Eaff472a42BE341B2";
const ZCHF = "0xB58E61C3098d85632Df34EecfB899A1Ed80921cB";

async function tvl(_, _b, _cb, { api }) {
  // Add Minting Hub Reserve
  const tokensAndOwners = Collaterals.map((i) => [i, MintingHub]);

  // Add Frankencoin Pool Share Reserve
  tokensAndOwners.push([ZCHF, FPS]);

  // Add underyling collaterals of all positions
  const { positions } = await cachedGraphQuery(
    "frankencoin",
    "https://api.thegraph.com/subgraphs/name/frankencoin-zchf/frankencoin-subgraph",
    "{ positions { position collateral } }"
  );
  positions.forEach((i) => tokensAndOwners.push([i.collateral, i.position]));
  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  ethereum: {
    tvl,
  },
  start: 1698487043,
};
