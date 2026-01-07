const { get } = require('../helper/http')

async function tvl(api) {
  //Get all the vaults in the protocol
  const assetsUrl = "https://free-api.vestige.fi/assets/locked";
  const assets = await get(assetsUrl);

  let tvl = 0;

  await Promise.all(
    assets.map(async (asset) => {
      const assetId = asset.asset_id;
      const supplyInTvlLocked = asset.supply_in_tvl_locked;
      const priceUrl = `https://free-api.vestige.fi/asset/${assetId}/price`;
      const priceResponse = await get(priceUrl);
      const price = priceResponse.USD;
      tvl += supplyInTvlLocked * price * 2;
    })
  );

  api.addUSDValue(Math.round(tvl))
}

module.exports = {
  timetravel:false,
  misrepresentedTokens:true,
  methodology:`Counts tokens in LPs only, transforms the price to USD and * them by 2 to account for the other side.`,
  algorand: { tvl },
};
