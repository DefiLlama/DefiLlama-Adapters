const tokens = {
  usdt: { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimal: 6 },
  usdc: { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimal: 6 },
  arpa: { address: '0xba50933c268f567bdc86e1ac131be072c6b0b71a', decimal: 18 },
  wbtc: { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', decimal: 8 },
  dai: { address: '0x6b175474e89094c44da98b954eedeac495271d0f', decimal: 18 },
  busd: { address: '0x4fabb145d64652a948d72533023f6e7a623c7c53', decimal: 18 },
  hbtc: { address: '0x0316EB71485b0Ab14103307bf65a021042c6d380', decimal: 18 },
  bella: { address: '0xa91ac63d040deb1b7a5e4d4134ad23eb0ba07e14', decimal: 18 },
  weth: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimal: 18 },
}

const bVaults = {
  bUsdt: { address: "0x2c23276107b45E64c8c59482f4a24f4f2E568ea6", decimal: 6 },
  bUsdc: { address: "0x8016907D54eD8BCf5da100c4D0EB434C0185dC0E", decimal: 6 },
  bArpa: { address: "0x750d30A8259E63eD72a075f5b6630f08ce7996d0", decimal: 18 },
  bWbtc: { address: "0x3fb6b07d77dace1BA6B5f6Ab1d8668643d15a2CC", decimal: 8 },
  bHbtc: { address: "0x8D9A39706d3B66446a298f1ae735730257Ec6108", decimal: 18 },
}

const uniswapV2Pools = {
  usdcUsdt: { address: '0x3041cbd36888becc7bbcbc0045e3b1f144466f5f', decimal: 18 },
  belUsdt: { address: '0xf0d1109e723cb06e400e2e57d0b6c7c32bedf61a', decimal: 18 },
  arpaUsdt: { address: '0x9F624b25991b99D7b14d6740A9D581DD77980808', decimal: 18 },
  wbtcUsdt: { address: '0x0de0fa91b6dbab8c8503aaa2d1dfa91a192cb149', decimal: 18 },
}

const bStaking = "0x6Cb6FF550Ea4473Ed462F8bda38aE3226C04649d"
const bLocker = "0x20b91c9826E1a500570ea9c6396DBa8cff473A93"

const getToken = (tokenSymbol) => tokens[tokenSymbol]
const getTokenAddress = (tokenSymbol) => getToken(tokenSymbol).address
const getTokenDecimal = (tokenSymbol) => getToken(tokenSymbol).decimal

const getBToken = (bTokenSymbol) => bVaults[bTokenSymbol]
const getBTokenAddress = (bTokenSymbol) => getBToken(bTokenSymbol).address
const getBTokenDecimal = (bTokenSymbol) => getBToken(bTokenSymbol).decimal

const getUniSwapLpToken = (lpTokenSymbol) => uniswapV2Pools[lpTokenSymbol]
const getUniSwapLpTokenAddress = (lpTokenSymbol) => getUniSwapLpToken(lpTokenSymbol).address
const getUniSwapLpTokenDecimal = (lpTokenSymbol) => getUniSwapLpToken(lpTokenSymbol).decimal

module.exports = { 
  getTokenAddress, 
  getTokenDecimal, 
  getBTokenAddress, 
  getBTokenDecimal, 
  getUniSwapLpTokenAddress, 
  getUniSwapLpTokenDecimal,
  bStaking, 
  bLocker,
}