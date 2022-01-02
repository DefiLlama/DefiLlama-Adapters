const { ohmTvl } = require('../helper/ohm')

const treasury = "0xbDE54dF36c48456128c0f09D38Ba2b8E778bD2A4"
module.exports = ohmTvl(treasury, [
    //WBNB
    ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", false],
    //BUSD
    ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false],
    //USDC
    ["0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", false],
    //PancakeLP
    ["0x2023ee355a2C01f084589f87B4Fb9A113F940207", true],
   ], "bsc", "0x411Ba19A7D908068A1Cb5BD808da008f5A977Cbc", "0x453939C0270e9405876C7f047aDE3932FD2d7a51", undefined, undefined, false)