const { tokens, getAssetInfo } = require("../helper/chain/algorand");
const axios = require("axios");

const vestigePriceApi = "https://free-api.vestige.fi";

async function tvl() {
  const meldAssets = [tokens.gold$, tokens.silver$];
  let totalMeldMarketCap = 0;

  for (const asset of meldAssets) {
    const assetInfo = await getAssetInfo(asset);
    const circulatingSupply = assetInfo.circulatingSupply;
    // Get the GOLD$ or SILVER$ price from vestige.fi API
    const { data } = await axios.get(`${vestigePriceApi}/asset/${asset}/price`);
    const marketCap = (circulatingSupply * data.USD) / 1e6;
    totalMeldMarketCap += marketCap;
  }

  return totalMeldMarketCap;
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl,
  },
};
