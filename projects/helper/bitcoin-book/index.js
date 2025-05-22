const ainn = require('./ainn-layer2.js')
const allo = require('./allo.js')
const avalanche = require('./avalanche-btc.js')
const fetchers = require('./fetchers.js')
const bevm = require('./bevm.js')
const binance = require('./binance.js')
const binance2 = require('./binance-btc.js')
const bitstable = require('./bitstable-finance.js')
const boringdao = require('./boringdao.js')
const bsquaredBTC = require('./bsquaredBTC.js')
const bsquaredBRC20 = require('./bsquaredBRC20.js')
const elSalvador = require('./elSalvador.js')
const garden = require('./garden.js')
const hopeMoney = require('./hope-money.js')
const krakenBTC = require('./kraken-btc.js')
const lorenzo = require('./lorenzo.js')
const lorenzo2 = require('./lorenzo-enzoBTC.js')
const merlin = require('./merlin.js')
const multibit = require('./multibit.js')
const obelisk = require('./obelisk.js')
const roup = require('./roup.js')
const tronBTC = require('./tron-btc.js')
const wbtc = require('./wbtc.js')
const xlink = require('./xlink.js')
const xlinkLST = require('./xlinkLST.js')
const xrgb = require('./xrgb.js')
const imbtc = require('./imbtc.js')
const twentyOneCo = require('./21Co.js')
const avalonCedefi = require('./avalon-cedefi.js')
const pstakeBTC = require('./pstake-btc.js')
const biconomy = require('./biconomy-cex.js')
const bigone = require('./bigone.js')
const bingCex = require('./bing-cex.js')
const bitfinex = require('./bitfinex.js')
const bitget = require('./bitget.js')
const bitmake = require('./bitmake.js')
const bitmark = require('./bitmark.js')
const bitmex = require('./bitmex.js')
const bitunixCex = require('./bitunix-cex.js')
const bitvenus = require('./bitvenus.js')
const blofinCex = require('./blofin-cex.js')
const btse = require('./btse.js')
const bybit = require('./bybit.js')
const cakeDefi = require('./cake-defi.js')
const coindcx = require('./coindcx.js')
const coinex = require('./coinex.js')
const coinsquare = require('./coinsquare.js')
const coinw = require('./coinw.js')
const cryptoCom = require('./crypto-com.js')
const deribit = require('./deribit.js')
const fbiDprk = require('./fbi-dprk.js')
const mtGoxEntities = require('./mt-gox-entities.js')
const silkroadFBIEntities = require('./silkroad-fbifunds-entities.js')
const fastex = require('./fastex.js')
const fire = require('./fire.js')
const flipster = require('./flipster.js')
const gateIo = require('./gate-io.js')
const hashkey = require('./hashkey.js')
const hashkeyExchange = require('./hashkey-exchange.js')
const hibt = require('./hibt.js')
const hotbit = require('./hotbit.js')
const huobi = require('./huobi.js')
const kleverExchange = require('./klever-exchange.js')
const korbit = require('./korbit.js')
const kraken = require('./kraken.js')
const kucoin = require('./kucoin.js')
const latoken = require('./latoken.js')
const maskex = require('./maskex.js')
const mento = require('./mento.js')
const mexcCex = require('./mexc-cex.js')
const mtGox = require('./mt-gox.js')
const nbx = require('./nbx.js')
const nonkyc = require('./nonkyc.js')
const okcoin = require('./okcoin.js')
const okex = require('./okex.js')
const phemex = require('./phemex.js')
const pionexCex = require('./pionex-cex.js')
const probit = require('./probit.js')
const robinhood = require('./robinhood.js')
const rosenBridge = require('./rosen-bridge.js')
const silkroad = require('./silkroad.js')
const swissborg = require('./swissborg.js')
const toobit = require('./toobit.js')
const indiaCovid = require('./india-covid.js')
const wooCEX = require('./woo-cex.js')
const bitlayerBridge = require('./bitlayer-bridge.js')
const arkhamExchange = require('./arkham-exchange.js')
const chakra = require('./chakra.js')
const nerveNetworkBridge = require('./nervenetworkbridge.js')
const nexusbtc = require('./nexusbtc')
const tapbit = require('./tapbit-cex.js')
const jbtc = require('./jbtc')
const bitkub = require('./bitkub-cex.js')
const coin8 = require('./coin8.js')
const bitrue = require('./bitrue-cex.js')
const cygnus = require('./cygnus.js')
const unitbtc = require('./unit-btc.js')
const backpack = require('./backpack.js')
const coinbasebtc = require('./coinbase-btc.js')
const prosper = require('./prosper.js')
const hotcoin = require('./hotcoin.js')
const orangex = require('./orangex.js')
const exmo = require('./exmo.js')
const esbtc = require('./esbtc.js')

const p2pb2b = ['39BFtTzZjj6o2s7eewefFQxqM4617VmhEK']
const teleswap = [
  '3CAQAw7m95axbY761Xq8d9DADhjNaX9b8o', // POLYGON_LOCKER
  '3KLdeu9maZAfccm3TeRWEmUMuw2e8SLo4v', // BNB_LOCKER
  '3E2hwnq5BsmP1ea6JUhjdKZjh2wy4NuQ8T', // BSQUARED_LOCKER
  '31uHNFfbejkbUD2B26o2CARfU1ALJ6x6Ag', // BOB_LOCKER
  '3LNsey3ceG9ZHkQ7bcfAjwnew7KVujHt29', // BRC20_LOCKER
]

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

const zeusZBTC = [
  // https://docs.zeusnetwork.xyz/intro/welcome-to-zeus-network/how-it-works-bitcoin-and-solana
  'bc1p698gf9gm8j34gvars97j6spsgrlxlhvyfajt2tsz2vnw9fcat9cqjcjn4v',
  'bc1p96utmwdngv3xwdn90d7wg4tyqke70fs6js8ajgqkk89zn08z8d5q8xzchd',
  'bc1pd46txhc0a3t8juc2r4njyuk4rv3099dcn039ny0hzgt24tgx3qlszg5e6f',
  'bc1p795t8whcfpl6uyxj38enzt43cg8scphrgvn2e79y3xgflv6s6nrsrmudk6',
  'bc1pq7pr972ckfwrwrprqw5en54ytr58jndcaafr780hm35ttz4ekmas3fctx4',
  'bc1qlw9h7fspehfvrgyhnr334936y2x6vurw7svxq3'
]

const magpie = [
  '1FoGLbVfpN6e35J45vXSwqsTSajcSxXcYF',
  'bc1ppgxcpqq7vm5ckl3unryndeqheut8lanjtpng9jwxjdv6m53w9wuqx4fqy8'
]

module.exports = {
  ...fetchers,
  hemiBTC: ['16NuSCxDVCAXbKs9GRbjbHXbwGXu3tnPSo'],
  zeusZBTC,
  cygnus,
  magpie,
  stacksSBTC,
  bitomato,
  bitlayerBridge,
  teleswap,
  ssiProtocol,
  ainn,
  allo,
  avalanche,
  bevm,
  binance,
  binance2,
  bitstable,
  boringdao,
  bsquaredBTC,
  bsquaredBRC20,
  elSalvador,
  garden,
  hopeMoney,
  krakenBTC,
  lorenzo,
  lorenzo2,
  merlin,
  multibit,
  obelisk,
  roup,
  tronBTC,
  wbtc,
  xlink,
  xlinkLST,
  xrgb,
  imbtc,
  twentyOneCo,
  avalonCedefi,
  pstakeBTC,
  biconomy,
  bigone,
  bingCex,
  bitfinex,
  bitget,
  bitmake,
  bitmark,
  bitmex,
  bitunixCex,
  bitvenus,
  blofinCex,
  btse,
  bybit,
  cakeDefi,
  coindcx,
  coinex,
  coinsquare,
  coinw,
  cryptoCom,
  deribit,
  fbiDprk,
  mtGoxEntities,
  silkroadFBIEntities,
  fastex,
  fire,
  flipster,
  gateIo,
  hashkey,
  hashkeyExchange,
  hibt,
  hotbit,
  huobi,
  kleverExchange,
  korbit,
  kraken,
  kucoin,
  latoken,
  maskex,
  mento,
  mexcCex,
  mtGox,
  nbx,
  nonkyc,
  okcoin,
  okex,
  phemex,
  pionexCex,
  probit,
  robinhood,
  rosenBridge,
  silkroad,
  swissborg,
  toobit,
  indiaCovid,
  wooCEX,
  p2pb2b,
  arkhamExchange,
  chakra,
  nerveNetworkBridge,
  nexusbtc,
  tapbit,
  jbtc,
  bitkub,
  coin8,
  bitrue,
  unitbtc,
  backpack,
  coinbasebtc,
  prosper,
  lbank,
  hotcoin,
  orangex,
  exmo,
  esbtc
}
