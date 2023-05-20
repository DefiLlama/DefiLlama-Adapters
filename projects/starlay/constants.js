const ADDRESSES = require("../helper/coreAssets.json");
const DEFAULT_DECIMALS = 18;

const TOKEN_INFO = {
  dot: { key: "polkadot", decimals: 10 },
  ausd: {
    key: "acala-dollar",
    decimals: 12,
    address: "0xfFFFFfFF00000000000000010000000000000001",
  },
  wastr: { address: "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720" },
  nativeUsdt: { address: "0xffffffff000000000000000000000001000007c0" },
};

const LAY_ADDRESS = ADDRESSES.astar.LAY;

const TOKENS = {
  // WASTR
  [TOKEN_INFO.wastr.address.toLowerCase()]: "astar",
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
  [TOKEN_INFO.nativeUsdt.address.toLowerCase()]: ADDRESSES.ethereum.USDT,
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
  [TOKEN_INFO.ausd.address.toLowerCase()]: TOKEN_INFO.ausd.key,
  // LAY
  [ADDRESSES.astar.LAY]: "starlay-finance",
};

const VOTING_ESCROW_ADDRESS = "0xDf32D28c1BdF25c457E82797316d623C2fcB29C8";

module.exports = {
  DEFAULT_DECIMALS,
  TOKEN_INFO,
  LAY_ADDRESS,
  TOKENS,
  VOTING_ESCROW_ADDRESS,
};
