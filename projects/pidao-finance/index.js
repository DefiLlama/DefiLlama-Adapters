const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require('../helper/ohm')

const treasury = "0x458B737d87C40252EC11b160C76bb1C53F248b28"
module.exports = ohmTvl(treasury, [
    //busd 
    [ADDRESSES.bsc.BUSD, false],
    //busd-usd
    [ADDRESSES.bsc.USDT, false],
    //TrueUSD
    [ADDRESSES.bsc.BTUSD, false],
    //MDEX LP
    ["0x149a712378aba63882c1d372739eb47a6fd0e12e", true],
    //Pancake LPs
    ["0x3991e0988a69e4c8fde46c011dafe55e26fdd18d", true],
    //Pancake LPs 1
    ["0xc0d02c7fc87e50a6580c4091d9d76bb7e38b05b8", true],
], "bsc", "0x22d1704817D42bdE262d778bFE097e287151371D", "0x1215ed20aa507578ca352e195016f289e7a17f3a")