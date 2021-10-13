const PieDAO = require("./pieDAO.js");

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

async function staking(timestamp, ethBlock) {
    // creating the PieDAO helper...
    let pieDAO = new PieDAO(ethBlock);

    // calculating the total DOUGHs staked...
    await pieDAO.calculateStakedDough();
}

module.exports = {
    ethereum:{
        staking,
        tvl
    }
}
