const { staking } = require("../helper/staking");
const { pool2Exports } = require("../helper/pool2");

const acre = "0x00ee200df31b869a321b10400da10b561f3ee60d";
const stakingContract = "0x4bc722Cd3F7b29ae3A5e0a17a61b72Ea5020502B";
const farming = "0x598EBAC38cF211749b1277c9a34d217226A476Af";
const acrewavaxpgl = "0x64694FC8dFCA286bF1A15b0903FAC98217dC3AD7";


module.exports = {
    avax:{
        tvl: async () => ({}),
        staking: staking(stakingContract, acre),
        pool2: pool2Exports(farming, [acrewavaxpgl], "avax")
    }
}