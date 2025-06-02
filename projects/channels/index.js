const { compoundExports2 } = require('../helper/compound');

const comptroller = {
    heco: "0x8955aeC67f06875Ee98d69e6fe5BDEA7B60e9770",
    bsc: "0x8Cd2449Ed0469D90a7C4321DF585e7913dd6E715",
    arbitrum: "0x3C13b172bf8BE5b873EB38553feC50F78c826284"
}

const ceth = {
    bsc: "0x14E134365F754496FBC70906b8611b8b49f66dd4",
    heco: "0x397c6D1723360CC1c317CdC9B2E926Ae29626Ff3",
}

module.exports = {
    ...Object.keys(comptroller).reduce((exp, chain) => {
        exp[chain] = compoundExports2({ comptroller: comptroller[chain], cether: ceth[chain]})
        return exp
    }, {})
}

module.exports.heco.borrowed = ()  => ({})
module.exports.bsc.borrowed = ()  => ({})
module.exports.arbitrum.borrowed = ()  => ({})
module.exports.deadFrom = '2025-05-01' 