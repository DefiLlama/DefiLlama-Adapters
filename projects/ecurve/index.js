// const utils = require("../helper/utils");

async function fetch() {
    // https://ecurve.finance/
    // const stats = await utils.fetchURL("https://iit9dyqn3h.execute-api.us-east-1.amazonaws.com/GetEcurveStats")
    // const tvl = stats.data.reduce((previous, row) => previous + row.tvl, 0 );
    return 0;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `eCurve TVL is achieved by making a call to its eCurve API.`,
  eos: { tvl: () => ({  }) }
}