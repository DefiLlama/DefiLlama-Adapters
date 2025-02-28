const { toUSDTBalances } = require("../helper/balances");
const { get } = require('../helper/http')

async function staking() {
  // Get the total supply in OGY
  // Ref: https://github.com/ORIGYN-SA/origyn-sns/blob/master/backend/canisters/token_metrics/impl/src/queries/http_request.rs#L40
  const totalSupplyUrl = 'https://juolv-3yaaa-aaaal-ajc6a-cai.raw.icp0.io/total-supply';
  const totalSupply = await get(totalSupplyUrl);
  
  // Get the circulating supply in OGY
  // Ref: https://github.com/ORIGYN-SA/origyn-sns/blob/master/backend/canisters/token_metrics/impl/src/queries/http_request.rs#L43
  const circulatingSupplyUrl = 'https://juolv-3yaaa-aaaal-ajc6a-cai.raw.icp0.io/circulating-supply';
  const circulatingSupply = await get(circulatingSupplyUrl);
  
  // Get the OGY/USDT market price
  const ogyPriceUrl = 'https://api.origyn.com/ogy/price';
  const ogyPriceData = await get(ogyPriceUrl);
  const ogyUsdt = ogyPriceData.ogyPrice;

  // The token value locked is the locked supply
  // total supply - circulating supply
  const tokenTvl = (totalSupply - circulatingSupply) * ogyUsdt;

  return toUSDTBalances(tokenTvl);
}

async function tvl() {
  // Get the total value of ORIGYN Certificates
  // Ref: https://github.com/ORIGYN-SA/origyn-sns/blob/master/backend/canisters/collection_index/impl/src/queries/http_request.rs#L29
  const collectionIndexUrl = 'https://leqqw-uaaaa-aaaaj-azsba-cai.raw.icp0.io/stats';
  const collectionIndexData = await get(collectionIndexUrl);
  const collectionTvl = collectionIndexData.total_value_locked;

  return toUSDTBalances(collectionTvl);
}

module.exports = {
  timetravel: false,
  methodology: "TVL the total locked value of staked tokens and the total asset value of ORIGYN certificates.",
  icp: {
    tvl,
    staking,
  },
}
