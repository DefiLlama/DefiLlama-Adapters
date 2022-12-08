const { get } = require('./helper/http')

async function fetch() {
  return (await get("https://api.crema.finance/v1/swap/count")).data.tvl_in_usd;
}

module.exports = {
  timetravel: false,
  fetch,
};
