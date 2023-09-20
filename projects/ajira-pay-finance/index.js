const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const ASSETS = require('./assets.json')

const KAVA_STREAM_VAULT  = '0xd8FDE1F90895AB64E74efD376129Ae3e79F1B9f9'

const KAVA_ASSETS = [
  nullAddress,
  ADDRESSES.kava.WKAVA,
  ADDRESSES.kava.DAI,
  ADDRESSES.kava.USDT,
  ADDRESSES.kava.USDt,
  ADDRESSES.kava.BUSD,
  ADDRESSES.kava.USDC,
  ADDRESSES.kava.ETH,
  ADDRESSES.kava.SUSHI,
  ADDRESSES.kava.axlUSDC,
  ADDRESSES.kava.axlUSDT,
  ADDRESSES.kava.axlDAI,
  ASSETS.kava.axlWBTC,
  ASSETS.kava.axlWETH,
  ASSETS.kava.axlATOM,
  ADDRESSES.kava.WETH,
  ADDRESSES.kava.WBTC,
  ADDRESSES.kava.USX,
  ASSETS.kava.ATOM,
  ASSETS.kava.VARA,
  ASSETS.kava.MIM,
  ASSETS.kava.PINKAV,
  ASSETS.kava.BNB,
  ASSETS.kava.MARE,
  ASSETS.kava.TAROT,
  ASSETS.kava.YFX,
  ASSETS.kava.GMD,
  ASSETS.kava.acsVARA,
  ASSETS.kava.QI,
  ASSETS.kava.CHAM,
  ASSETS.kava.LION
]

module.exports = {
  methodology: "TVL is based on the active balances of assets deposited at the stream vault for token streaming.",
  kava: {
    tvl: sumTokensExport({ owners: [KAVA_STREAM_VAULT], tokens: KAVA_ASSETS}),
  }
};
