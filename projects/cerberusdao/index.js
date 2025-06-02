const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')

const treasury = "0x56D595ea5591D264bc1Ef9E073aF66685F0bFD31"
module.exports = {
    deadFrom: 1648765747,
    ...ohmTvl(treasury, [
    //SHIB
    [ADDRESSES.ethereum.INU, false],
    //FLOKI
    ["0x43f11c02439e2736800433b4594994bd43cd066d", false],
    //WETH
    [ADDRESSES.ethereum.WETH, false],
    //uniswap LP shib/weth
    ["0xb5b6c3816c66fa6bc5b189f49e5b088e2de5082a", true],
   ], "ethereum", "0x95deaF8dd30380acd6CC5E4E90e5EEf94d258854", "0x8a14897eA5F668f36671678593fAe44Ae23B39FB")
}