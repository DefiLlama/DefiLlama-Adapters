const {get} = require("../helper/http")

async function getData(api) {
  const isoTimestamp = new Date((api.timestamp - 5 * 60 * 60) * 1000).toISOString();
  return await get('https://prodv1.securesecrets.org/defillama/moneymarket/' + isoTimestamp);
}

async function tvl(api) {
  const data = await getData(api)
  api.addUSDValue(data.collateralTvl + data.loanableTvl)
}

async function borrowed(api) {
  const data = await getData(api)
  api.addUSDValue(data.lentTvl)
}

module.exports = {
  misrepresentedTokens: true,
  secret: {
    tvl,
    borrowed,
  }
}
