const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");
const VECTOR = require("../vector/vectorContracts.json");
const axios = require('axios')

const xliplessDex = "0x82E90fB94fd9a5C19Bf38648DD2C9639Bde67c74";

async function tvl(api) {
  const getAssetRes = await axios.get("https://app.fwx.finance/api/v2/assets?chain_id=43114")
  const assets = getAssetRes.data.assets

  let tokensAndOwners = [];
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i]
    tokensAndOwners.push(
      [asset.token_address, asset.pool_address],
      [asset.token_address, asset.core_address],
      [asset.token_address, xliplessDex],
    );
  }

  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  avax: {
    tvl,
  },
};