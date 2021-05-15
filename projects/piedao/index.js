const PieDAO = require("./pieDAO.js");

async function fetch() {
    // creating the PieDAO helper...
    let pieDAO = new PieDAO();

    // calculating the total for Ovens...
    await pieDAO.calculateOvens();

    // calculating the total for Pies...
    await pieDAO.calculatePies();

    // calculating the total for Pools...
    await pieDAO.calculatePools();    

    // finally, returning the total NAV...
    return pieDAO.calculateNAV();
}

fetch().then(console.log).catch(error => console.error("error", error));

module.exports = {
    fetch
}
