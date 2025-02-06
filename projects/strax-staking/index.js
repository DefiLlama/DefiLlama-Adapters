const { get } = require('../helper/http')

async function fetchTvl() {
  const amount = await get('https://liquid.stratisplatform.com/api/tvl');
  return { stratis: amount };
}

module.exports = {
  methodology: "TVL is the total amount of STRAX staked by the community",
  timetravel: false,
  stratis: {
    tvl: fetchTvl
  }
};
