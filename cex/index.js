const { cexExports } = require('../projects/helper/cex')

const configs = {
  "21-co": require('./21-co.js'),
  "TradeOgre": require('./TradeOgre.js'),
  "arkham-exchange": require('./arkham-exchange.js'),
  "biconomy-cex": require('./biconomy-cex.js'),
  "bigone": require('./bigone.js'),
  "binance-us": require('./binance-us.js'),
  "bing-cex": require('./bing-cex.js'),
  "bitcointry": require('./bitcointry.js'),
  "bitkan": require('./bitkan.js'),
  "bitkub-cex": require('./bitkub-cex.js'),
  "bitlo-cex": require('./bitlo-cex.js'),
  "bitmake": require('./bitmake.js'),
  "bitmark": require('./bitmark.js'),
  "bitmex": require('./bitmex.js'),
  "bitomato": require('./bitomato.js'),
  "bitunix-cex": require('./bitunix-cex.js'),
  "bitvavo": require('./bitvavo.js'),
  "bitvenus": require('./bitvenus.js'),
  "blofin-cex": require('./blofin-cex.js'),
  "btse": require('./btse.js'),
  "bybit": require('./bybit.js'),
  "bydfi": require('./bydfi.js'),
  "bytedex-cex": require('./bytedex-cex.js'),
  "cake-defi": require('./cake-defi.js'),
  "cex-io": require('./cex-io.js'),
  "coin8-cex": require('./coin8-cex.js'),
  "coindcx": require('./coindcx.js'),
  "coinsquare": require('./coinsquare.js'),
  "coinstore": require('./coinstore.js'),
  "coinw": require('./coinw.js'),
  "crypto-com": require('./crypto-com.js'),
  "cygnus-btc": require('./cygnus-btc.js'),
  "deribit": require('./deribit.js'),
  "exmo": require('./exmo.js'),
  "fastex": require('./fastex.js'),
  "fire": require('./fire.js'),
  "flipster": require('./flipster.js'),
  "gate-us": require('./gate-us.js'),
  "grovex": require('./grovex.js'),
  "hashkey": require('./hashkey.js'),
  "hashkey-exchange": require('./hashkey-exchange.js'),
  "hibt": require('./hibt.js'),
  "hotbit": require('./hotbit.js'),
  "hotcoin": require('./hotcoin.js'),
  "indodax": require('./indodax.js'),
  "klever-exchange": require('./klever-exchange.js'),
  "korbit": require('./korbit.js'),
  "kraken": require('./kraken.js'),
  "latoken": require('./latoken.js'),
  "lbank-exchange": require('./lbank-exchange.js'),
  "levex": require('./levex.js'),
  "maskex": require('./maskex.js'),
  "mexc-cex": require('./mexc-cex.js'),
  "mt-gox": require('./mt-gox.js'),
  "nbx": require('./nbx.js'),
  "nexo-cex": require('./nexo-cex.js'),
  "nonkyc": require('./nonkyc.js'),
  "okcoin": require('./okcoin.js'),
  "orangex-cex": require('./orangex-cex.js'),
  "osl": require('./osl.js'),
  "osl-hk": require('./osl-hk.js'),
  "ourbit": require('./ourbit.js'),
  "p2pb2b": require('./p2pb2b.js'),
  "phemex": require('./phemex.js'),
  "pionex-cex": require('./pionex-cex.js'),
  "poloniex-cex": require('./poloniex-cex.js'),
  "probit": require('./probit.js'),
  "robinhood": require('./robinhood.js'),
  "sclite": require('./sclite.js'),
  "silkroad-fbifunds": require('./silkroad-fbifunds.js'),
  "swissborg": require('./swissborg.js'),
  "tapbit-cex": require('./tapbit-cex.js'),
  "toobit": require('./toobit.js'),
  "tothemoon": require('./tothemoon.js'),
  "valr-cex": require('./valr-cex.js'),
  "weex-cex": require('./weex-cex.js'),
  "woo-cex": require('./woo-cex.js'),
  "zoomex-cex": require('./zoomex-cex.js'),
}

// keys that are protocol metadata rather than chain configs
const META_KEYS = ['methodology', 'hallmarks', 'misrepresentedTokens', 'doublecounted']

const allProtocols = {}
for (const [name, rawConfig] of Object.entries(configs)) {
  const config = { ...rawConfig }
  const meta = {}
  for (const k of META_KEYS) {
    if (config[k] !== undefined) { meta[k] = config[k]; delete config[k] }
  }
  allProtocols[name] = Object.assign(cexExports(config), meta)
}

module.exports = allProtocols
