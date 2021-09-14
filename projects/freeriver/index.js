const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

const wMOVR = "0x98878B06940aE243284CA214f92Bb71a2b032B8A" // their own barely used version

module.exports={
    tvl: calculateUsdUniTvl("0x52abD262B13bef4E65Ff624880E8A0595a17af48", "moonriver", wMOVR, 
    [
        '0x63F2ADf5f76F00d48fe2CBef19000AF13Bb8de82', // FREE
        '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d', // USDC
        '0xb44a9b6905af7c801311e8f4e76932ee959c663c', // USDT
        '0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c', // WETH
        '0x5d9ab5522c64e1f6ef5e3627eccc093f56167818', // BUSD
    ], "moonriver")
}