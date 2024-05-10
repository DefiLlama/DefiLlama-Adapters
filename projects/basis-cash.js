const ADDRESSES = require('./helper/coreAssets.json')

async function tvl(api) {
  const toa = [
    [ADDRESSES.ethereum.DAI, '0xEBd12620E29Dc6c452dB7B96E1F190F3Ee02BDE8'],
    [ADDRESSES.ethereum.sUSD, '0xdc42a21e38c3b8028b01a6b00d8dbc648f93305c'],
    [ADDRESSES.ethereum.USDT, '0x2833bdc5B31269D356BDf92d0fD8f3674E877E44'],
    [ADDRESSES.ethereum.USDC, '0x51882184b7F9BEEd6Db9c617846140DA1d429fD4'],
    ['0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8', '0xC462d8ee54953E7d7bF276612b75387Ea114c3bf'],
  ]

  return api.sumTokens({ tokensAndOwners: toa })
}


module.exports = {
  ethereum: {
    tvl
  }
}
