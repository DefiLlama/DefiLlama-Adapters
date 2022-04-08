const { stakingUnknownPricedLP } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const photon = "0x2F1305F0619ADa14688A4291953bd7d284f9C2a5";
const stakingContract = "0x81177472Ce36A9b1AB573804CD215C72cEb76F36";
const photonbusd = "0xEBAa17dA7D5C616441290669E9D2c982c8B1Da25"; //PHOTON-BUSD
const treasury = "0x0f90591b01DE6F832e8B8E4ec3525efD423BCaD1";
const treasuryTokens = [
    ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false], // BUSD
];

async function tvl (timestamp, block, chainBlocks) {
    let balances = {};
    await sumTokensAndLPsSharedOwners(balances, treasuryTokens, [treasury], chainBlocks.bsc, "bsc", addr=>`bsc:${addr}`);
    return balances;
}

module.exports = {
    bsc: {
        tvl,
        staking: stakingUnknownPricedLP(stakingContract, photon, "bsc", photonbusd, addr=>`bsc:${addr}`)
    }
}