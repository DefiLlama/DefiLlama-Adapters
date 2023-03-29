// const { ohmTvl } = require('../helper/ohm')

// const treasury = "0x39914b5b0687882659d74b7a82e07Ca3acBf9a8c"
// module.exports = ohmTvl(treasury, [
//     //WBNB
//     ["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", false],
//     //BUSD
//     ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false],
//     //USDC
//     ["0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", false],
//     //PancakeLP
//     ["0x63D9DEf04dcBf82870f46f50db5C1eFeCcb1Cd63", true],
//    ], "bsc", "0x5132e14a2673DA61581364d792E90B926F10bC8e", "0xfAAec9f866Fa7f34a2c31c2B11D1723Ad4a46446", undefined, undefined, true)


// NOTE: treasury is emptied, token is worthless, adapter is left alone for historical data
module.exports = {
    bsc: {
        tvl: () => ({}),
        staking: () => ({}),
    }
}