const { tombTvl } = require("../helper/tomb");

const peak = "0x1F5550A0F5F659E07506088A7919A88DfF37218f";
const pro = "0x259EF6776648500D7F1A8aBA3651E38b1121e65e";
const summit = "0x9a03e23954578A63791581aed74cE1948871755e"; 
const PShareRewardPool = "0x2115686293c2096383A58713086276FAa6E09628"; 


const pool2LPs = [
    "0x603e67714A1b910DCCFDcae86dbeC9467de16f4c", //peak/metis
    "0x9F881c2a9cF0ff6639A346b30AB6E663071Cb4C1" //pro/metis address
]

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(peak, pro, PShareRewardPool, summit, pool2LPs, "metis", undefined, false, pool2LPs[1],),
};