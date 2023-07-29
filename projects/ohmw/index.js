const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')
const { getFixBalancesSync } = require('../helper/portedTokens')

module.exports= {
  hallmarks: [
    [1670457600, "Rug Pull"]
  ],
  ...ohmTvl("0xE0Fe9Af0208ba444F81eDF348F23bd1A91Dc395E", [
    ["0x11bbB41B3E8baf7f75773DB7428d5AcEe25FEC75", false], // USDC
    [ADDRESSES.ethereum.WETH, false], // WETH
    ["0x2569134cbe40da06C1c9c1A24A7E1D2641099cA6", true], // OHMW-ETHW SLP
  ], "ethpow", "0x55C07a8AB97DAF79D478fE2bC2090858F0708AFF", "0xA5174cB46A15bD7d90Af7664372b1f4207a9ABea",undefined, getFixBalancesSync('ethpow'))
}