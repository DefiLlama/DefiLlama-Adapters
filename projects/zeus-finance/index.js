const ADDRESSES = require('../helper/coreAssets.json')
const {addFundsInMasterChef} = require("../helper/masterchef");
const {stakingUnknownPricedLP} = require("../helper/staking");
const {pool2BalanceFromMasterChefExports} = require("../helper/pool2")

const token = "0x813658e307fA4DAF9B25e7CE1dE3b40012CA2B74";
const masterchef = "0xCb0349992fCA780b9D6F95Fbbc88d318Ac092A5d";

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, masterchef, chainBlocks.cronos, "cronos", addr=>{
        if (addr.toLowerCase() === "0xf2001b145b43032aaf5ee2884e456ccd805f677d") {
            return ADDRESSES.ethereum.DAI
        }
        return `cronos:${addr}`
    }, undefined, [token], true, true, token);
    return balances;
}


module.exports = {
    deadFrom: 1648765747,
    cronos: {
        tvl,
        staking: stakingUnknownPricedLP(masterchef, token, "cronos", "0x0A833865703639cf1f9125FEDCA5F2094Fc56d90"),
        pool2: pool2BalanceFromMasterChefExports(masterchef, token, "cronos", addr=>`cronos:${addr}`)
    }
}
