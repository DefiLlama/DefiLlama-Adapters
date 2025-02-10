const { toUSDTBalances } = require("../helper/balances");
const { get } = require('../helper/http')

async function tvl() {
  // Get the total value of ORIGYN Certificates
  const collectionIndexUrl = 'https://leqqw-uaaaa-aaaaj-azsba-cai.raw.icp0.io/stats';
  const collectionIndexData = await get(collectionIndexUrl);
  const collectionTvl = collectionIndexData.total_value_locked;
  
  // Get the total supply in OGY
  const totalSupplyUrl = 'https://juolv-3yaaa-aaaal-ajc6a-cai.raw.icp0.io/total-supply';
  const totalSupply = await get(totalSupplyUrl);
  
  // Get the circulating supply in OGY
  const circulatingSupplyUrl = 'https://juolv-3yaaa-aaaal-ajc6a-cai.raw.icp0.io/circulating-supply';
  const circulatingSupply = await get(circulatingSupplyUrl);
  
  // Get the OGY/USDT
  const ogyPriceUrl = 'https://api.origyn.com/ogy/price';
  const ogyPriceData = await get(ogyPriceUrl);
  const ogyUsdt = ogyPriceData.ogyPrice;

  // The token value locked is the locked supply
  // total supply - circulating supply
  const tokenTvl = (totalSupply - circulatingSupply) * ogyUsdt;

  return toUSDTBalances(tokenTvl + collectionTvl);
}

module.exports = {
  timetravel: false,
  methodology: "TVL the total locked value of tokens (non-circulating) plus the total value of ORIGYN certificates",
  icp: {
    tvl,
  },
}
