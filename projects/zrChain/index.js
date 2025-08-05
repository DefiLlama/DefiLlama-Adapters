const sdk = require('@defillama/sdk');
const axios = require('axios');

const ZRCHAIN_ZENBTC_SUPPLY_API = "https://api.diamond.zenrocklabs.io/zenbtc/supply";

async function tvl(api) {
  const balances = {};
  
  try {
    const response = await axios.get(ZRCHAIN_ZENBTC_SUPPLY_API);
    const custodiedBTCRaw = response.data.custodiedBTC;
    
    const custodiedBTCInWholeUnits = parseFloat(custodiedBTCRaw) / (10 ** 8);
    
    sdk.util.sumSingleBalance(balances, 'bitcoin', custodiedBTCInWholeUnits);
    
  } catch (error) {
    console.error("Error fetching ZenBTC supply:", error.message);
    throw error;
  }
  
  return balances;
}

module.exports = {
  methodology: 'Counts the total amount of BTC custodied in the ZenBTC protocol by fetching supply data from the ZenRock API.',
  start: 1732127947, // November 20, 2024 19:39:07 GMT+2 (block 1)
  timetravel: false,
  zrchain: {
    tvl,
  },
};
