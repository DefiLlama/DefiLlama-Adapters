const ADDRESSES = require("../helper/coreAssets.json");
const { fetchURL } = require('../helper/utils');

async function fetchTvl(api) {
  const response = await fetchURL("https://api.gas111.com/api/v1/internal/tokens/balances-list") 
  for (const pool of response.data) {
    api.add(ADDRESSES.ton.TON, pool.bonding_curve_balance)
  }
}


module.exports = {
  methodology: `
  Each token launched via gaspump has a bonding curve. The TVL is the sum of all bonding curve balances.
  It is slightly different from the address balance, which is composed from curve balance + fees accumulated.
  `.trim(),
  timetravel: false,
  ton: {
    tvl: fetchTvl
  }
}
