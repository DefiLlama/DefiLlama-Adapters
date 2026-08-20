const { sumTokens } = require('../helper/sumTokens');
const { getConfig } = require('../helper/cache');

// Coinbase publishes one proof-of-reserves feed per wrapped asset, all in the same schema:
// { reservesTotal, wrappedAssetsTotal, reserveAddresses: [{ address, balance: { amount } }] }
const getReserves = (asset) => getConfig(`coinbase-${asset}-proof-of-reserves`, `https://www.coinbase.com/${asset}/proof-of-reserves.json`)

const reservesTvl = (asset, tokens) => async (api) => {
  const { reserveAddresses } = await getReserves(asset)
  return sumTokens({ api, owners: reserveAddresses.map(i => i.address), tokens })
}

module.exports = {
  getReserves,
  reservesTvl,
}
