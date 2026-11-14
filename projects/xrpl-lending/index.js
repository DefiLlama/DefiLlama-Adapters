const { getExports } = require('../helper/heroku-api')

// balances are computed by ./api.js in the custom-scripts runner (bulky group) and read back from elastic
module.exports = {
  timetravel: false,
  methodology: 'Single Asset Vaults (XLS-65) and the Lending Protocol (XLS-66) are features of the XRP Ledger itself, so every vault, loan broker and loan is a ledger object. TVL is the assets each vault holds right now (AssetsAvailable) plus the first-loss capital held by loan brokers (CoverAvailable). Borrowed is the outstanding principal of every loan. All objects are listed and read from one validated ledger.',
  ...getExports('xrpl-lending', ['ripple'], ['borrowed']),
}
