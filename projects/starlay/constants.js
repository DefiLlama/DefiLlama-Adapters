const ADDRESSES = require("../helper/coreAssets.json");
const DEFAULT_DECIMALS = 18;

const TOKEN_INFO = {
  dot: { key: "polkadot", decimals: 10 },
  ausd: { key: "acala-dollar", decimals: 12 },
  wastr: {
    key: "astar",
    address: "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720",
  },
};

const TOKENS = {
  // WASTR
  [TOKEN_INFO.wastr.address.toLowerCase()]: TOKEN_INFO.wastr.key,
  // WETH
  [ADDRESSES.astar.WETH]: ADDRESSES.ethereum.WETH,
  // wBTC
  [ADDRESSES.astar.WBTC]: ADDRESSES.ethereum.WBTC,
  // SDN
  [ADDRESSES.astar.SDN]: "shiden",
  // USDC
  [ADDRESSES.astar.USDC]: ADDRESSES.ethereum.USDC,
  // USDT (celer USDT)
  [ADDRESSES.astar.USDT]: ADDRESSES.ethereum.USDT,
  // USDT (native USDT)
  [ADDRESSES.astar.nativeUSDT]: ADDRESSES.ethereum.USDT,
  // DAI
  [ADDRESSES.astar.DAI]: ADDRESSES.ethereum.DAI,
  // BUSD
  [ADDRESSES.astar.BUSD]: "binance-usd",
  // MATIC
  [ADDRESSES.astar.MATIC]: "matic-network",
  // BNB
  [ADDRESSES.astar.BNB]: "binancecoin",
  // DOT
  [ADDRESSES.astar.DOT]: TOKEN_INFO.dot.key,
  // aUSD
  [ADDRESSES.astar.aUSD]: TOKEN_INFO.ausd.key,
  // LAY
  [ADDRESSES.astar.LAY]: "starlay-finance",
};

const VOTING_ESCROW_ADDRESS = "0xDf32D28c1BdF25c457E82797316d623C2fcB29C8";
const LAY_ADDRESS = ADDRESSES.astar.LAY;

module.exports = {
  DEFAULT_DECIMALS,
  TOKEN_INFO,
  LAY_ADDRESS,
  TOKENS,
  VOTING_ESCROW_ADDRESS,
};
