const {addFundsInMasterChef} = require("../helper/masterchef");
const {pool2BalanceFromMasterChefExports} = require("../helper/pool2");
const {staking} = require("../helper/staking");

const masterchef = "0x2755AC6BD7BDbaCbdE08504f45f73D150Ee660F5";
const trick = "0xA5aFce54270D9afA6a80464bBD383BE506888e6A";

async function tvl (timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, masterchef, chainBlocks.fantom, "fantom", addr=>`fantom:${addr}`, undefined, [trick], true, true, trick);
    return balances;
}

module.exports = {
    fantom: {
        tvl,
        pool2: pool2BalanceFromMasterChefExports(masterchef, trick, "fantom", addr=>`fantom:${addr}`),
        staking: staking(masterchef, trick, "fantom")
    }
}