const axios = require("axios");
const BigNumber = require("bignumber.js");

const URL = 'https://aptos-mainnet-econia.nodeinfra.com';

const USDC_FILTER = 'quote_account_address=eq.0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa&quote_module_name=eq.asset&quote_struct_name=eq.USDC';

function integerPriceToNominal(price, market) {
  return price * market.tick_size * Math.pow(10, market.base_decimals) / market.lot_size / Math.pow(10, market.quote_decimals)
}

async function getTvl() {
  const markets = (await axios.get(`${URL}/markets?${USDC_FILTER}&order=market_id.asc`)).data;
  const tvls = (await axios.get(`${URL}/tvl_per_market?${USDC_FILTER}&order=market_id.asc`)).data;

  const convertedTvls = await Promise.all(tvls.map(async tvl => {
    const market = markets.find(m => m.market_id == tvl.market_id);
    if (market.last_fill_price_24hr) {
      return tvl.quote_value / Math.pow(10, market.quote_decimals) + tvl.base_value / Math.pow(10, market.base_decimals) * integerPriceToNominal(market.last_fill_price_24hr, market);
    } else {
      const last_fill = (await axios.get(`${URL}/fill_events?market_id=eq.${market.market_id}&order=txn_version.desc,event_idx.desc&limit=1`)).data;
      if(last_fill.length == 1) {
        return tvl.quote_value / Math.pow(10, market.quote_decimals) + tvl.base_value / Math.pow(10, market.base_decimals) * integerPriceToNominal(last_fill[0].price, market);
      } else {
        return 0;
      }
    }
  }))

  const tvl = convertedTvls.reduce((p, c) => p + c, 0);

  return tvl;
}

module.exports = {
  aptos: {
    fetch: getTvl
  },
  fetch: getTvl
}
