const { fetchURL } = require("../helper/utils");

async function tvl(){
  const res = await fetchURL("https://staderverse.staderlabs.com/tvl")
  return {
    "terrausd": res.data.totalStakedLunaInUst / 1e6
  }
}

module.exports = {
    timetravel: false,
    methodology: 'We aggregated the luna staked across Stader stake-pools & liquid token and then converted to UST',
    terra: {
        tvl,
    }
}

