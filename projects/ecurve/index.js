const utils = require("../helper/utils");

async function fetch() {
    // https://ecurve.finance/
    const stats = await utils.fetchURL("https://iit9dyqn3h.execute-api.us-east-1.amazonaws.com/GetEcurveStats")
    const tvl = stats.data.reduce((previous, row) => previous + row.tvl, 0 );
    return tvl
}

module.exports = {
  methodology: `eCurve TVL is achieved by making a call to its eCurve API.`,
  name: 'eCurve',
  fetch
}