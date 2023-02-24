const { compoundExports } = require('../helper/compound');

const comptroller = {
    heco: "0x8955aeC67f06875Ee98d69e6fe5BDEA7B60e9770",
    bsc: "0x8Cd2449Ed0469D90a7C4321DF585e7913dd6E715",
    arbitrum: "0x3C13b172bf8BE5b873EB38553feC50F78c826284"
}

const ceth = {
    bsc: "0x14E134365F754496FBC70906b8611b8b49f66dd4",
    heco: "0x397c6D1723360CC1c317CdC9B2E926Ae29626Ff3",
}

const native = {
    bsc: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    heco: "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f",
}

module.exports = {
    ...Object.keys(comptroller).reduce((exp, chain) => {
        exp[chain] = compoundExports(comptroller[chain], chain, ceth[chain], native[chain], undefined, symbol => ["MLP", "CLP", "SLP"].some(c => symbol.includes(c)))
        return exp
    }, {})
}
