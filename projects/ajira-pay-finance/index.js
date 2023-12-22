const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')
const LLAMA_ADDRESSES = require('../helper/coreAssets.json')
const ASSETS = require('./assets.json')

const KAVA_STREAM_VAULT  = '0xd8FDE1F90895AB64E74efD376129Ae3e79F1B9f9'
const POLYGON_POS_STREAM_VAULT = "0x015E0622F4311eA67dEcB5b433EFd611EF7600c2"

const KAVA_ASSETS = [
  LLAMA_ADDRESSES.kava.SUSHI,
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
  LLAMA_ADDRESSES.kava.WKAVA,
  LLAMA_ADDRESSES.kava.DAI,
  LLAMA_ADDRESSES.kava.USDT,
  LLAMA_ADDRESSES.kava.USDt,
  LLAMA_ADDRESSES.kava.BUSD,
  LLAMA_ADDRESSES.kava.USDC,
  LLAMA_ADDRESSES.kava.ETH,
  LLAMA_ADDRESSES.kava.axlUSDC,
  LLAMA_ADDRESSES.kava.axlUSDT,
  LLAMA_ADDRESSES.kava.axlDAI,
  ASSETS.kava.axlWBTC,
  ASSETS.kava.axlWETH,
  ASSETS.kava.axlATOM,
  LLAMA_ADDRESSES.kava.WETH,
  LLAMA_ADDRESSES.kava.WBTC,
  LLAMA_ADDRESSES.kava.USX,
  ASSETS.kava.ATOM,
  ASSETS.kava.MIM,
  ASSETS.kava.BNB,
]

const POLYGON_ASSET_STABLES = [
  nullAddress,
  LLAMA_ADDRESSES.polygon.USDT,
  LLAMA_ADDRESSES.polygon.USDC,
  LLAMA_ADDRESSES.polygon.DAI,
  LLAMA_ADDRESSES.polygon.WBTC,
  LLAMA_ADDRESSES.polygon.WETH,
  LLAMA_ADDRESSES.polygon.WMATIC
]

const POLYGON_POS_ASSETS = [
  ASSETS.polygon['1INCH'],
  ASSETS.polygon.AAVE,
  ASSETS.polygon.ANKR,
  ASSETS.polygon.ART,
  ASSETS.polygon.BANK,
  ASSETS.polygon.BAT,
  ASSETS.polygon.BOB,
  ASSETS.polygon.CBL,
  ASSETS.polygon.COMP,
  ASSETS.polygon.CRV,
  ASSETS.polygon.DANK,
  ASSETS.polygon.DHT,
  ASSETS.polygon.DUSD,
  ASSETS.polygon.ETHA,
  ASSETS.polygon.FRAX,
  ASSETS.polygon.FS,
  ASSETS.polygon.GC,
  ASSETS.polygon.GCR,
  ASSETS.polygon.GRT,
  ASSETS.polygon.LDO,
  ASSETS.polygon.LINK,
  ASSETS.polygon.MANA,
  ASSETS.polygon.MASK,
  ASSETS.polygon.METAS,
  ASSETS.polygon.MKR,
  ASSETS.polygon.MTA,
  ASSETS.polygon.OCEAN,
  ASSETS.polygon.PAXG,
  ASSETS.polygon.QI,
  ASSETS.polygon.SHF,
  ASSETS.polygon.SHIB,
  ASSETS.polygon.SNX,
  ASSETS.polygon.SUSHI,
  ASSETS.polygon.TUSD,
  ASSETS.polygon.UDT,
  ASSETS.polygon.UFI,
  ASSETS.polygon.UNI,
  ASSETS.polygon.jCAD,
  ASSETS.polygon.jCHF,
  ASSETS.polygon.jEUR,
  ASSETS.polygon.jGBP,
  ASSETS.polygon.jGBP
]

const LINEA_ASSET_STABLES = [
  nullAddress,
  LLAMA_ADDRESSES.linea.DAI,
  LLAMA_ADDRESSES.linea.USDC,
  LLAMA_ADDRESSES.linea.USDT,
  ASSETS.linea.WBTC,
  ASSETS.linea.WETH
]

module.exports = {
  methodology: "TVL is based on the active balances of assets deposited at the stream and vesting vaults for token streaming and vesting.",
  kava: {
    tvl: sumTokensExport({ owners: [KAVA_STREAM_VAULT], tokens: KAVA_ASSETS_STABLE}),
    vesting: sumTokensExport({ owners: [KAVA_STREAM_VAULT], tokens: KAVA_ASSETS})
  },
  polygon: {
    tvl: sumTokensExport({ owners: [POLYGON_POS_STREAM_VAULT], tokens: POLYGON_ASSET_STABLES}),
    vesting: sumTokensExport({ owners: [POLYGON_POS_STREAM_VAULT], tokens: POLYGON_POS_ASSETS})
  }
};
