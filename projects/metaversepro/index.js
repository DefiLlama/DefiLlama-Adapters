const { ohmTvl } = require('../helper/ohm')

const treasury = "0xb874ac3a21e3ffe06fb4b6dcf9b62c7ea753a9a0"
module.exports = ohmTvl(treasury, [
    //WBNB 
    ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", false],
    //BUSD
    ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false],
    //Pancake LP
    ["0x512385e505615eb30ec80A2915575E344ACf792A", true],
    //Pancake LPs 1
    ["0x1dd778e874dc1b45a676e38aba1916517c3648c8", true],
    //Pancake LPs 2
    ["0x5438c0730e45ef25ec5e5110c939dc0c90aec4b4", true],
    //Pancake LPs 3
    ["0x1c8ed2f2cef333aa43f1ba9a4589899c53787d2f", true],
],  "bsc", "0xb91db0c2551aae4784119ce4c33234c9e3c9af71", "0x0a2046C7fAa5a5F2b38C0599dEB4310AB781CC83", undefined, undefined, false)