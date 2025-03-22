const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  methodology:"Get USD value of the TVL from the API",
  eclipse: {
    tvl: tvlApi,
  },
};

async function tvlApi(api) {
  const data = await get("https://api.umbra.finance/1/explore/tvl")
  const tvlValue = data.result[data.result.length - 1]?.data ?? 0
  return api.addUSDValue(tvlValue)
}
