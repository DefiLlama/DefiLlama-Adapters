const sdk = require("@defillama/sdk");
const axios = require("axios");
const { staking } = require("../helper/staking");
const { transformPolygonAddress } = require("../helper/portedTokens");

// Polygon
const polygonApiEndpoint =
  "https://mvx-api-polygon-5sx8b.ondigitalocean.app/tokens";
const polygonVault = "0x32848E2d3aeCFA7364595609FB050A301050A6B4";
const polygonStaking = "0xE8e2E78D8cA52f238CAf69f020fA961f8A7632e9"; // Staked MVX, sMVX
const polygonMVX = "0x2760e46d9bb43dafcbecaad1f64b93207f9f0ed7";

const polygonTVL = async (timestamp, block, chainBlocks) => {
  const transform = await transformPolygonAddress();
  const balances = {};
  const allTokens = (await axios.get(polygonApiEndpoint)).data;

  const tokenBalances = await sdk.api.abi.multiCall({
    block: chainBlocks.polygon,
    calls: allTokens.map((token) => ({
      target: token.id,
      params: [polygonVault],
    })),
    abi: "erc20:balanceOf",
    chain: "polygon",
  });

  sdk.util.sumMultiBalanceOf(balances, tokenBalances, false, transform);

  return balances;
};

module.exports = {
  polygon: {
    staking: staking(polygonStaking, polygonMVX, "polygon", "mvx", 18),
    tvl: polygonTVL,
  },
};
