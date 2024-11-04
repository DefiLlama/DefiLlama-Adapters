const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require("../helper/http");

const coins = {
  deepType: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
  suiType: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
  usdcType: ADDRESSES.sui.USDC_CIRCLE,
  bethType: "0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH",
  wusdtType: ADDRESSES.sui.USDT,
  wusdcType: ADDRESSES.sui.USDC,
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