const ADDRESSES = require('../helper/coreAssets.json')
const {staking} = require("../helper/staking");

module.exports = {
    methodology: 'SkyDex counts the staking values as tvl',
    start: 3744214,
    era: {
        tvl: staking(
            ["0x68a2C99883643cCc531F009d97B152EbeAA99D5E", "0x65d533DD20a17aD25F509e5E1676E878117E0f22",
            "0xCD6d16eDeB01DAC8BC4D5BB9927cC24b70b5DECB", "0x3bFc00098B77D9773d6A929eAF3C2c729d2Fa029",
            "0x9ACe7C1687b01D9c53bf8EfAadAacf5d80BC0758"],
            ["0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4", "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C",
            "0x2039bb4116B4EFc145Ec4f0e2eA75012D6C0f181", "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
            "0x32Fd44bB869620C0EF993754c8a00Be67C464806"]
        )
    }
};
