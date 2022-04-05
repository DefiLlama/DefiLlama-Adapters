/*const { tombTvl } = require("../helper/tomb");

const peak = "0x1F5550A0F5F659E07506088A7919A88DfF37218f";
const pro = "0x259EF6776648500D7F1A8aBA3651E38b1121e65e";
const summit = ""; // need summit address
const PShareRewardPool = "0x2115686293c2096383A58713086276FAa6E09628"; //need reward pool


const pool2LPs = [
    "0x603e67714A1b910DCCFDcae86dbeC9467de16f4c", //peak/metis
    "0x9F881c2a9cF0ff6639A346b30AB6E663071Cb4C1" //pro/metis address
]

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(peak, pro, PShareRewardPool, summit, pool2LPs, "metis", undefined, false, pool2LPs[1],)
}*/

const { sumLPWithOnlyOneToken} = require("../helper/unwrapLPs");

const PShareRewardPool = "0x2115686293c2096383A58713086276FAa6E09628";
const lpPool2Addresses = "0x603e67714A1b910DCCFDcae86dbeC9467de16f4c"; //peak/metis
const lpPool2ProMetis =  "0x9F881c2a9cF0ff6639A346b30AB6E663071Cb4C1";



async function peakPool2(timestamp, ethBlock, chainBlocks){
    const balances = {}
    await sumLPWithOnlyOneToken(balances, lpPool2Addresses, PShareRewardPool, "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000", chainBlocks["metis"], "metis", addr => `metis:${addr}`);
    await sumLPWithOnlyOneToken(balances, lpPool2ProMetis, PShareRewardPool, "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000", chainBlocks["metis"], "metis", addr => `metis:${addr}`);
    return balances
}


module.exports = {
  misrepresentedTokens: true,
  metis: {
    tvl: () => ({}),
    pool2: peakPool2,
  },
  methodology: "Counts liquidity of the Pool2 PEAK/METIS",
};