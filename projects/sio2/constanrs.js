const DEFAULT_DECIMALS = 18

const SIO2_TOKEN = "SIO2_TOKEN"
const DOT_TOKEN = "polkadot"

const SIO2_DECIMALS = 18

const SIO2_ADDRESS = "0x04fD8d256f15b54283b5852f0acF0Aa651F7a5D8" // TODO need to check this, get this from https://blockscout.com/astar/address/0x04fD8d256f15b54283b5852f0acF0Aa651F7a5D8

const TOKENS = {
  // WASTR
  "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720": "astar",
  // DOT
  "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF": DOT_TOKEN,
  // BAI
  "0x733ebcc6df85f8266349defd0980f8ced9b45f35": 'bai-stablecoin', // TODO need to check this get this from https://blockscout.com/astar/address/0x733ebcC6DF85f8266349DEFD0980f8Ced9B45f35
  // USDC
  "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98":
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  // USDT
  "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283":
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
  // BUSD
  "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E": "binance-usd",
  // DAI
  "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb":
    "0x6b175474e89094c44da98b954eedeac495271d0f",
  // WETH
  "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c":
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  // wBTC
  "0xad543f18cFf85c77E140E3E5E3c3392f6Ba9d5CA":
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  // BNB
  "0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52": "binancecoin",

  // SIO2
  [SIO2_ADDRESS]: "sio2-finance",
};


module.exports = {
  DEFAULT_DECIMALS,
  SIO2_DECIMALS,
  SIO2_TOKEN,
  SIO2_ADDRESS,
  TOKENS,
}
