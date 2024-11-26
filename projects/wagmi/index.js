const ADDRESSES = require("../helper/coreAssets.json");
const { fetchURL } = require('../helper/utils');

async function fetchTvl(api) {
    const response = await fetchURL("https://tonfunstats-eqnd7.ondigitalocean.app/api/v1/getBondingCurveBalanceSum")
    api.add(ADDRESSES.ton.TON, response.data.balance)
}


module.exports = {
    methodology: `
  TVL is calculated on the backend by summing up all the balances of the bonding curves that have not gone to the DEX yet.
  `.trim(),
    timetravel: false,
    ton: {
        tvl: fetchTvl
    }
}
