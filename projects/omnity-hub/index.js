const { get } = require("../helper/http");

module.exports = {
  methodology: `TVL data is pulled from the our indexer and calculated, our own explorer can be found here https://explorer.omnity.network/`,
  misrepresentedTokens: true,
  icp: { tvl: icpTVL },
  osmosis: { tvl: osmosisTVL },
};

async function icpTVL(api) {
  let result = await get("https://api.omnity.network/api/tvl");
  return api.addUSDValue(result.icp.tvl ?? 0)
}

async function osmosisTVL(api) {
  let result = await get("https://api.omnity.network/api/tvl");
  return api.addUSDValue(result.osmosis.tvl ?? 0)
}
