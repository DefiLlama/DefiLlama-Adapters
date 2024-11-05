const ainn = require('./ainn-layer2.js')
const allo = require('./allo.js')
const avalance = require('./avalanche-btc.js')
const fetchers = require('./fetchers.js')
const bevm = require('./bevm.js')
const binance = require('./binance.js')
const binance2 = require('./binance-btc.js')
const bitstable = require('./bitstable-finance.js')
const boringdao = require('./boringdao.js')
const bsquared = require('./bsquared.js')
const elSalvador = require('./elSalvador.js')
const garden = require('./garden.js')
const hopeMoney = require('./hope-money.js')
const kraken = require('./kraken-btc.js')
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

module.exports = {
  ...fetchers,
  ainn,
  allo,
  avalance,
  bevm,
  binance,
  binance2,
  bitstable,
  boringdao,
  bsquared,
  elSalvador,
  garden,
  hopeMoney,
  kraken,
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
  pstakeBTC
}