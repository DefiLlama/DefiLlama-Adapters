const imports = [
  ["ainn", './ainn-layer2.js'],
  ["allo", './allo.js'],
  ["avalanche", './avalanche-btc.js'],
  ["bevm", './bevm.js'],
  ["binance", './binance.js'],
  ["binance2", './binance-btc.js'],
  ["bitstable", './bitstable-finance.js'],
  ["boringdao", './boringdao.js'],
  ["bsquaredBTC", './bsquaredBTC.js'],
  ["bsquaredBRC20", './bsquaredBRC20.js'],
  ["elSalvador", './elSalvador.js'],
  ["garden", './garden.js'],
  ["hopeMoney", './hope-money.js'],
  ["krakenBTC", './kraken-btc.js'],
  ["lorenzo", './lorenzo.js'],
  ["lorenzo2", './lorenzo-enzoBTC.js'],
  ["merlin", './merlin.js'],
  ["multibit", './multibit.js'],
  ["obelisk", './obelisk.js'],
  ["roup", './roup.js'],
  ["tronBTC", './tron-btc.js'],
  ["wbtc", './wbtc.js'],
  ["xlink", './xlink.js'],
  ["xlinkLST", './xlinkLST.js'],
  ["xrgb", './xrgb.js'],
  ["imbtc", './imbtc.js'],
  ["twentyOneCo", './21Co.js'],
  ["avalonCedefi", './avalon-cedefi.js'],
  ["pstakeBTC", './pstake-btc.js'],
  ["biconomy", './biconomy-cex.js'],
  ["bigone", './bigone.js'],
  ["bingCex", './bing-cex.js'],
  ["bitfinex", './bitfinex.js'],
  ["bitget", './bitget.js'],
  ["bitmake", './bitmake.js'],
  ["bitmark", './bitmark.js'],
  ["bitmex", './bitmex.js'],
  ["bitunixCex", './bitunix-cex.js'],
  ["bitvenus", './bitvenus.js'],
  ["blofinCex", './blofin-cex.js'],
  ["btse", './btse.js'],
  ["bybit", './bybit.js'],
  ["cakeDefi", './cake-defi.js'],
  ["coindcx", './coindcx.js'],
  ["coinex", './coinex.js'],
  ["coinsquare", './coinsquare.js'],
  ["coinw", './coinw.js'],
  ["cryptoCom", './crypto-com.js'],
  ["deribit", './deribit.js'],
  ["fbiDprk", './fbi-dprk.js'],
  ["mtGoxEntities", './mt-gox-entities.js'],
  ["silkroadFBIEntities", './silkroad-fbifunds-entities.js'],
  ["fastex", './fastex.js'],
  ["fire", './fire.js'],
  ["flipster", './flipster.js'],
  ["gateIo", './gate-io.js'],
  ["hashkey", './hashkey.js'],
  ["hashkeyExchange", './hashkey-exchange.js'],
  ["hibt", './hibt.js'],
  ["hotbit", './hotbit.js'],
  ["huobi", './huobi.js'],
  ["kleverExchange", './klever-exchange.js'],
  ["korbit", './korbit.js'],
  ["kraken", './kraken.js'],
  ["kucoin", './kucoin.js'],
  ["latoken", './latoken.js'],
  ["maskex", './maskex.js'],
  ["mento", './mento.js'],
  ["mexcCex", './mexc-cex.js'],
  ["mtGox", './mt-gox.js'],
  ["nbx", './nbx.js'],
  ["nonkyc", './nonkyc.js'],
  ["okcoin", './okcoin.js'],
  ["okex", './okex.js'],
  ["phemex", './phemex.js'],
  ["pionexCex", './pionex-cex.js'],
  ["probit", './probit.js'],
  ["robinhood", './robinhood.js'],
  ["rosenBridge", './rosen-bridge.js'],
  ["rskBridge", './rsk-bridge.js'],
  ["silkroad", './silkroad.js'],
  ["swissborg", './swissborg.js'],
  ["toobit", './toobit.js'],
  ["indiaCovid", './india-covid.js'],
  ["wooCEX", './woo-cex.js'],
  ["bitlayerBridge", './bitlayer-bridge.js'],
  ["arkhamExchange", './arkham-exchange.js'],
  ["chakra", './chakra.js'],
  ["nerveNetworkBridge", './nervenetworkbridge.js'],
  ["nexusbtc", './nexusbtc'],
  ["tapbit", './tapbit-cex.js'],
  ["jbtc", './jbtc'],
  ["bitkub", './bitkub-cex.js'],
  ["coin8", './coin8.js'],
  ["bitrue", './bitrue-cex.js'],
  ["cygnus", './cygnus.js'],
  ["unitbtc", './unit-btc.js'],
  ["backpack", './backpack.js'],
  ["coinbasebtc", './coinbase-btc.js'],
  ["coinbaseltc", './coinbase-ltc.js'],
  ["prosper", './prosper.js'],
  ["hotcoin", './hotcoin.js'],
  ["orangex", './orangex.js'],
  ["exmo", './exmo.js'],
  ["esbtc", './esbtc.js'],
  ["bimaCdp", './bima-cdp.js'],
  ["tzbtc", './tezos-btc.js'],
  ["tothemoon", './tothemoon.js'],
  ["indodax", './indodax.js'],
  ["river", './river.js'],
  ["echoMBTC", './echo-mBTC.js'],
  ["xbtc", './okx-xbtc.js'],
  ["leadbtc", './leadbtc.js'],
  ["bitgetBtc", './bitget-bgBTC.js'],
  ["magicEden", './magic-eden.js'],
  ["gateBtc", './gate-btc.js'],
  ["sodex", './sodex.js'],
  ["weex", './weex.js'],
  ["bydfi", './bydfi.js'],
  ["bytedex", './bytedex.js'],
]
const { sumTokensExport } = require('../sumTokens.js')
const fetchers = require('./fetchers.js')

const p2pb2b = ['39BFtTzZjj6o2s7eewefFQxqM4617VmhEK']

const ssiProtocol = [
  '1BH4rZH7ptWyjim6fLJDp9t8Jp2DgXiBDM'
]

const bitomato = [
  'bc1qgmtx3caf8rlxmzw703ga2sljv3rkkj39e4ysk9',
]

const lbank = [
  '1MZwhQkkt9wy8Mwm4rx5W3AYiDCJLasffn',
]

const stacksSBTC = [
  // https://docs.stacks.co/concepts/sbtc/clarity-contracts/sbtc-deposit
  'bc1pl033nz4lj7u7wz3l2k2ew3f7af4sdja8r25ernl00thflwempayswr5hvc',
  'bc1prcs82tvrz70jk8u79uekwdfjhd0qhs2mva6e526arycu7fu25zsqhyztuy',
]

const magpie = [
  '1FoGLbVfpN6e35J45vXSwqsTSajcSxXcYF',
  'bc1ppgxcpqq7vm5ckl3unryndeqheut8lanjtpng9jwxjdv6m53w9wuqx4fqy8'
]

function getBTCExport(key) {
  if (!module.exports[key])
    throw new Error(`No export found for ${key}`)
  const value = module.exports[key]

  if (Array.isArray(value))
    return sumTokensExport({ owners: value })

  if (typeof value === 'function')
    return async (api) => {
      let owners = await value()
      return sumTokensExport({ owners })(api)
    }

  throw new Error(`Unsupported BTC export type for ${key}`)
}

module.exports = {
  ...fetchers,
  getBTCExport,
  symbiosis: ['bc1qtnv5uqa5qt2jwftsj6667kpp8uvgt63p5k5hsn25wm6kjxzmxqnsyu79vc'],
  hemiBTC: ['16NuSCxDVCAXbKs9GRbjbHXbwGXu3tnPSo', '1GawhMSUVu3bgRiNmejbVTBjpwBygGWSqf', 'bc1q4lpa9d5zxehge7vx86784gcxy23hc3xwp3gl422venswe6pvhh5qpn9xfj'],
  p2pb2b,
  bitomato,
  lbank,
  stacksSBTC,
  magpie,
  ssiProtocol,
  'poloniex-cex': [
      "1LgW4RA5iE98khRJ58Bhx5RLABP3QGjn9y",
      "33Mz8zrWx6yei6itk2mjfCytdKJZEwKeM6",
      "1McbLy27nLVzJ4ubMnFm3jxnQ3nbq2mpr2",
      "1PrHfPbcLyHTUHxjizAgauCNXvjnh5LEex",
      "1NBX1UZE3EFPTnYNkDfVhRADvVc8v6pRYu",
      "17vH7EX655n5L4iPAfVXPn3rVzZbrgKYBC",
      "14XKsv8tT6tt8P8mfDQZgNF8wtN5erNu5D",
      "13hxUsGWnJgH2vzscAUrYm7pxgWzTvez7x",
      "1M3Y4dgeg8zVdQ41BXTaWyFUUmc2e6fF2b",
      "1QJt83Cb6S6Tm5chFwyn46XSBGYbS8unXB",
      "13r8PhQ9Gk1KavpJzjc8ELjEw3kBQKLRHq",
      "1NVuvqYpZPnWSd5Fvx15dq6u39ongzxLL2",
      "1KVpuCfhftkzJ67ZUegaMuaYey7qni7pPj",
      "1DMpkJ5QHu6rnWehZjVkZxsRTW7VRHk7yk",
    ],
}

imports.forEach(([key, file]) => {
  try {
    module.exports[key] = require(file)
  } catch (e) {
    console.error(`Error importing ${key} from ${file}:`, e)
  }
})
