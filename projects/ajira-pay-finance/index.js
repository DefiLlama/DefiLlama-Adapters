const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const ASSETS = require('./assets.json')

const KAVA_STREAM_VAULT  = '0xd8FDE1F90895AB64E74efD376129Ae3e79F1B9f9'
const CELO_STREAM_VAULT = "0xE19Dab2511C59341b37656F235F2A722953DcA09"
const POLYGON_POS_STREAM_VAULT = "0x015E0622F4311eA67dEcB5b433EFd611EF7600c2"

const KAVA_ASSETS = [
  ADDRESSES.kava.SUSHI,
  ASSETS.kava.VARA,
  ASSETS.kava.PINKAV,
  ASSETS.kava.MARE,
  ASSETS.kava.TAROT,
  ASSETS.kava.YFX,
  ASSETS.kava.GMD,
  ASSETS.kava.acsVARA,
  ASSETS.kava.QI,
  ASSETS.kava.CHAM,
  ASSETS.kava.LION
]

const KAVA_ASSETS_STABLE = [
  nullAddress,
  ADDRESSES.kava.WKAVA,
  ADDRESSES.kava.DAI,
  ADDRESSES.kava.USDT,
  ADDRESSES.kava.USDt,
  ADDRESSES.kava.BUSD,
  ADDRESSES.kava.USDC,
  ADDRESSES.kava.ETH,
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
  ASSETS.kava.MIM,
  ASSETS.kava.BNB,
]

const CELO_ASSET_STABLES = [
  nullAddress,
  ASSETS.celo.cUSD,
  ASSETS.celo.CELO,
  ASSETS.celo.cEUR
]

const POLYGON_ASSET_STABLES = [
  nullAddress,
  ASSETS.polygon.USDT,
  ASSETS.polygon.USDC
]

module.exports = {
  methodology: "TVL is based on the active balances of assets deposited at the stream vault for token streaming.",
  kava: {
    tvl: sumTokensExport({ owners: [KAVA_STREAM_VAULT], tokens: KAVA_ASSETS_STABLE}),
    vesting: sumTokensExport({ owners: [KAVA_STREAM_VAULT], tokens: KAVA_ASSETS}),
  },
  celo: {
    tvl: sumTokensExport({ owners: [CELO_STREAM_VAULT], tokens: CELO_ASSET_STABLES })
  },
  polygon: {
    tvl: sumTokensExport({ owners: [POLYGON_POS_STREAM_VAULT], tokens: POLYGON_ASSET_STABLES})
  }
};
