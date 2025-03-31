const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  ...getExports("polkadot", ['polkadot'], ['ownTokens',]),
  methodology:
    "TVL is calculated by summing up the balances across three chains: Relay Chain (DOT), Asset Hub (DOT, USDC, USDT, MYTHOS), and Hydration (DOT, USDC, USDT). The balances are fetched directly from the respective chain's treasury and related addresses.",
}
