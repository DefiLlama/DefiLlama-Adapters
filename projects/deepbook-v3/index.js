const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require("../helper/http");

const coins = {
  deepType: ADDRESSES.sui.DEEP,
  suiType: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
  usdcType: ADDRESSES.sui.USDC_CIRCLE,
  bethType: ADDRESSES.sui.ETH,
  wusdtType: ADDRESSES.sui.USDT,
  wusdcType: ADDRESSES.sui.USDC,
  nsType: "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS",
  typusType: "0xf82dc05634970553615eef6112a1ac4fb7bf10272bf6cbe0f80ef44a6c489385::typus::TYPUS",
  walType: "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL",
  xbtcType: "0x876a4b7bce8aeaef60464c11f4026903e9afacab79b9b142686158aa86560b50::xbtc::XBTC",
  sendType: "0xb45fcfcc2cc07ce0702cc2d229621e046c906ef14d9b25e8e4d25f6e8763fef7::send::SEND",
  drfType: "0x294de7579d55c110a00a7c4946e09a1b5cbeca2592fbb83fd7bfacba3cfeaf0e::drf::DRF",
  ausdType: "0x2053d08c1e2bd02791056171aab0fd12bd7cd7efad2ab8f6b9c8902f14df2ff2::ausd::AUSD",
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