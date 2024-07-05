const { fetchURL } = require("../helper/utils")
const BigNumber = require("bignumber.js");

const tvl = async () => {
  const res = await fetchURL("https://bonzoapi.azurewebsites.net/Stats");
  return BigNumber(res.data.total_liquidity_value.usd_wad).shiftedBy(-18);
}

module.exports = {
  timetravel: false,
  methodology: 'The calculated TVL is the current USD sum of deposits minus borrows for all all reserves found under https://app.bonzo.finance/',
  hedera: {
    tvl,
  }
}