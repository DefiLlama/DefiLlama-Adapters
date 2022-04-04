/*const { tombTvl } = require("../helper/tomb");

const peak = "0x1F5550A0F5F659E07506088A7919A88DfF37218f";
const pro = "0x259EF6776648500D7F1A8aBA3651E38b1121e65e";
const summit = ""; // need summit address
const peakRewardPool = ""; //need reward pool


const pool2LPs = [
    "0x603e67714A1b910DCCFDcae86dbeC9467de16f4c", //peak/metis
    //"" //need pro/metis address
]

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(peak, pro, peakRewardPool, summit, pool2LPs, "metis", undefined, false, pool2LPs[1],)
}*/

const { sumLPWithOnlyOneToken} = require("../helper/unwrapLPs");

const peakRewardPoolV2 = "0xFdB206de8C0c6cdAaD1c8e06B9fd5d926CDD7E31";
const lpPool2Addresses = "0x603e67714A1b910DCCFDcae86dbeC9467de16f4c"; //peak/metis


async function peakPool2(timestamp, ethBlock, chainBlocks){
    const balances = {}
    await sumLPWithOnlyOneToken(balances, lpPool2Addresses, peakRewardPoolV2, "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000", chainBlocks["metis"], "metis", addr => `metis:${addr}`)
    return balances
}


module.exports = {
  misrepresentedTokens: true,
  metis: {
    tvl: (async) => ({}),
    pool2: peakPool2,
  },
  methodology: "Counts liquidity of the Pool2 PEAK/METIS",
};