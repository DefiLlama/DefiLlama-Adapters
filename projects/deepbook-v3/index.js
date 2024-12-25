const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require("../helper/http");

const coins = {
  deepType: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
  suiType: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
  usdcType: ADDRESSES.sui.USDC_CIRCLE,
  bethType: ADDRESSES.sui.ETH,
  wusdtType: ADDRESSES.sui.USDT,
  wusdcType: ADDRESSES.sui.USDC,
  nsType: "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS",
  typusType: "0xf82dc05634970553615eef6112a1ac4fb7bf10272bf6cbe0f80ef44a6c489385::typus::TYPUS",
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
  start: '2024-10-14',
  sui: {
    tvl,
  }
}