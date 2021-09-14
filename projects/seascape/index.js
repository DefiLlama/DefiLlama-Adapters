const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

const wMOVR = "0xE3C7487Eb01C74b73B7184D198c7fBF46b34E5AF" // their own barely used version

module.exports={
    tvl: calculateUsdUniTvl("0xD184B1317125b166f01e8a0d6088ce1de61D00BA", "moonriver", wMOVR, 
    [
        "0xbD90A6125a84E5C512129D622a75CDDE176aDE5E", // RIB
        "0x6fc9651f45B262AE6338a701D563Ab118B1eC0Ce", // CROWNS
        '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d', // USDC
        '0xb44a9b6905af7c801311e8f4e76932ee959c663c', // USDT
        '0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c', // WETH
        '0x5d9ab5522c64e1f6ef5e3627eccc093f56167818', // BUSD
    ], "moonriver")
}