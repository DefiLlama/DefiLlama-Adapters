const { get } = require("../helper/http");

const coins = {
  deepType: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
  suiType: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
  usdcType: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
  bethType: "0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH",
  wusdtType: "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
  wusdcType: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
}

const endpointUrl = "https://deepbook-indexer.mainnet.mystenlabs.com"
const endpointName = "get_net_deposits"

const tvl = async (api) => {
  const url = `${endpointUrl}/${endpointName}/${Object.values(coins).join(',')}/${api.timestamp}`
  const data = await get(url)
  Object.keys(data).forEach(coin => {
    api.add(coin, data[coin])
  })
}

module.exports = {
  methodology: "All deposits into all BalanceManagers minutes all withdrawals from all BalanceManagers",
  start: 1728858752,
  sui: {
    tvl,
  }
}