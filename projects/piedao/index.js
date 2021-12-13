const PieDAO = require("./pieDAO.js");
const {staking} = require('../helper/staking')

async function tvl(timestamp, ethBlock) {
    // creating the PieDAO helper...
    let pieDAO = new PieDAO(ethBlock);

    // calculating the total for Ovens...
    await pieDAO.calculateOvens();

    // calculating the total for Pies...
    await pieDAO.calculatePies();

    // calculating the total for Pools...
    await pieDAO.calculatePools();    

    // finally, returning the total NAV...
    return pieDAO.calculateNAV();
}

module.exports = {
    ethereum:{
        staking: staking("0x6Bd0D8c8aD8D3F1f97810d5Cc57E9296db73DC45", "0xad32A8e6220741182940c5aBF610bDE99E737b2D"),
        tvl
    }
}
