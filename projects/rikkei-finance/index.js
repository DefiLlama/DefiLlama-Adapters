const { compoundExports } = require("../helper/compound");

module.exports = {
    bsc: {
        ...compoundExports(
            '0x4f3e801Bd57dC3D641E72f2774280b21d31F64e4',
            'bsc',
            '0x157822aC5fa0Efe98daa4b0A55450f4a182C10cA',
            '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
        )
    }
};