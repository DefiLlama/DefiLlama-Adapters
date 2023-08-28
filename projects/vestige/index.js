const axios = require("axios");

async function fetch() {
  //Get all the vaults in the protocol
  const assetsUrl = "https://free-api.vestige.fi/assets/locked";
  const assetsResponse = await axios.get(assetsUrl);
  const assets = assetsResponse.data;

  let tvl = 0;

  await Promise.all(
    assets.map(async (asset) => {
      const assetId = asset.asset_id;
      const supplyInTvlLocked = asset.supply_in_tvl_locked;
      const priceUrl = `https://free-api.vestige.fi/asset/${assetId}/price`;
      const priceResponse = await axios.get(priceUrl);
      const price = priceResponse.data.USD;
      tvl += supplyInTvlLocked * price * 2;
    })
  );
  tvl = tvl.toFixed(6)
  return tvl;
  
}

module.exports = {
  timetravel:false,
  misrepresentedTokens:true,
  methodology:`Counts tokens in LPs only, transforms the price to USD and * them by 2 to account for the other side.`,
  algorand: {
    fetch 
  },
  fetch
};
