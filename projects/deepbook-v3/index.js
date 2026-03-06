const { get } = require("../helper/http");

const assetsUrl = "https://deepbook-indexer.mainnet.mystenlabs.com/assets";
const endpointUrl = "https://deepbook-indexer.mainnet.mystenlabs.com";
const endpointName = "get_net_deposits";
const marginSupplyEndpoint = "margin_supply";

const tvl = async (api) => {
  const assets = await get(assetsUrl);
  const coins = Object.values(assets).map(a => a.asset_type);
  const url = `${endpointUrl}/${endpointName}/${coins.join(',')}/${api.timestamp}`
  const data = await get(url)
  coins.forEach(coin => {
    api.add(coin, data[coin])
  })

  // Add margin supply
  const marginSupply = await get(`${endpointUrl}/${marginSupplyEndpoint}`)
  Object.entries(marginSupply).forEach(([symbol, amount]) => {
    if (assets[symbol]) api.add(assets[symbol].asset_type, amount)
  })

  const { usdTvl } = await api.getUSDJSONs();
  if (usdTvl < 0) throw new Error("Something might be wrong: TVL returned a negative value");
}

module.exports = {
  methodology: "All deposits into all BalanceManagers minutes all withdrawals from all BalanceManagers",
  start: '2024-10-14',
  sui: { tvl }
}
