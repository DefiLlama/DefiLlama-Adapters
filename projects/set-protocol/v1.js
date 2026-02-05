const ADDRESSES = require('../helper/coreAssets.json')

const tokens = [
  ADDRESSES.ethereum.WETH,
  ADDRESSES.ethereum.WBTC,
  ADDRESSES.ethereum.LINK,
  ADDRESSES.ethereum.SAI,
  ADDRESSES.ethereum.DAI,
  ADDRESSES.ethereum.USDC,
  '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // cUSDC
  '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643', // cDAI
]

module.exports = async function tvl(api) {
  return api.sumTokens({ tokens, owner: '0x5B67871C3a857dE81A1ca0f9F7945e5670D986Dc'})
};
