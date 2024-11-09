const { addPools, calculatePies, } = require("./pieDAO.js");
const { staking } = require('../helper/staking')

async function tvl(api) {
    await Promise.all([
        addPools(api),
        calculatePies(api),
    ])
}

module.exports = {
    ethereum: {
        staking: staking("0x6Bd0D8c8aD8D3F1f97810d5Cc57E9296db73DC45", "0xad32A8e6220741182940c5aBF610bDE99E737b2D"),
        tvl
    }
}
