const ADDRESSES = require("../helper/coreAssets.json");
const DEFAULT_DECIMALS = 18;

const TOKEN_INFO = {
  dot: { key: "polkadot", decimals: 10 },
  ausd: { key: "acala-dollar", decimals: 12 },
};

const LAY_ADDRESS = ADDRESSES.astar.LAY;

const TOKENS = {
  // WASTR
  "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720": "astar",
  // WETH
  [ADDRESSES.moonbeam.USDT]: ADDRESSES.ethereum.WETH,
  // wBTC
  [ADDRESSES.astar.WBTC]: ADDRESSES.ethereum.WBTC,
  // SDN
  [ADDRESSES.astar.SDN]: "shiden",
  // USDC
  [ADDRESSES.moonbeam.USDC]: ADDRESSES.ethereum.USDC,
  // USDT
  [ADDRESSES.astar.USDT]: ADDRESSES.ethereum.USDT,
  // DAI
  [ADDRESSES.astar.DAI]: ADDRESSES.ethereum.DAI,
  // BUSD
  [ADDRESSES.oasis.ceUSDT]: "binance-usd",
  // MATIC
  [ADDRESSES.astar.MATIC]: "matic-network",
  // BNB
  [ADDRESSES.milkomeda.BNB]: "binancecoin",
  // DOT
  [ADDRESSES.astar.DOT]: TOKEN_INFO.dot.key,
  // aUSD
  "0xfFFFFfFF00000000000000010000000000000001": TOKEN_INFO.ausd.key,
  // LAY
  [LAY_ADDRESS]: "starlay-finance",
};

const VOTING_ESCROW_ADDRESS = "0xDf32D28c1BdF25c457E82797316d623C2fcB29C8";

module.exports = {
  DEFAULT_DECIMALS,
  TOKEN_INFO,
  LAY_ADDRESS,
  TOKENS,
  VOTING_ESCROW_ADDRESS,
};
