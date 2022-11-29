const { sumTokens } = require('./helper/unwrapLPs')

async function tvl(ts, block) {
  const toa = [
    ['0x6b175474e89094c44da98b954eedeac495271d0f', '0xEBd12620E29Dc6c452dB7B96E1F190F3Ee02BDE8'],
    ['0x57ab1ec28d129707052df4df418d58a2d46d5f51', '0xdc42a21e38c3b8028b01a6b00d8dbc648f93305c'],
    ['0xdac17f958d2ee523a2206206994597c13d831ec7', '0x2833bdc5B31269D356BDf92d0fD8f3674E877E44'],
    ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0x51882184b7F9BEEd6Db9c617846140DA1d429fD4'],
    ['0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8', '0xC462d8ee54953E7d7bF276612b75387Ea114c3bf'],
  ]

  return sumTokens(undefined, toa, block)
}


module.exports = {
  ethereum: {
    tvl
  }
}
