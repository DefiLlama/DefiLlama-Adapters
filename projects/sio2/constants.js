const ADDRESSES = require('../helper/coreAssets.json')
const DEFAULT_DECIMALS = 18

const DOT_TOKEN = "polkadot"
const DOT_DECIMALS = 10

const TOKENS = {
  // WASTR
  "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720": "astar",
  // DOT
  [ADDRESSES.astar.DOT]: DOT_TOKEN,
  // BAI
  [ADDRESSES.astar.BAI]: "bai-stablecoin",
  // USDC
  [ADDRESSES.moonbeam.USDC]: ADDRESSES.ethereum.USDC,
  // USDT
  [ADDRESSES.astar.USDT]:
    ADDRESSES.ethereum.USDT,
  // BUSD
  [ADDRESSES.oasis.ceUSDT]: "binance-usd",
  // DAI
  [ADDRESSES.astar.DAI]:
    ADDRESSES.ethereum.DAI,
  // WETH
  [ADDRESSES.moonbeam.USDT]:
    ADDRESSES.ethereum.WETH,
  // wBTC
  [ADDRESSES.astar.WBTC]:
    ADDRESSES.ethereum.WBTC,
  // BNB
  [ADDRESSES.milkomeda.BNB]: "binancecoin",
};

module.exports = {
  DEFAULT_DECIMALS,
  DOT_DECIMALS,
  DOT_TOKEN,
  TOKENS,
}
