const ADDRESSES = require('../helper/coreAssets.json')
const {addFundsInMasterChef} = require("../helper/masterchef");
const {stakingUnknownPricedLP} = require("../helper/staking");
const {pool2BalanceFromMasterChefExports} = require("../helper/pool2");

const bird = "0x9A3d8759174f2540985aC83D957c8772293F8646";
const masterchef = "0xDF937094C6f2B757Dfd1265e5e1550Ea0055b27A";

const translate = {
    [ADDRESSES.cronos.SHIB]: ADDRESSES.ethereum.INU,
    [ADDRESSES.shiden.ETH]: "avax:" + ADDRESSES.avax.WAVAX,
    [ADDRESSES.moonriver.USDT]: "fantom:" + ADDRESSES.fantom.WFTM,
    "0x9b8077c6590b560f1a9d60512648277d29b35a3b": "polygon:0x8a953cfe442c5e8855cc6c61b1293fa648bae472",
    [ADDRESSES.kcc.DAI]: "polygon:" + ADDRESSES.polygon.WMATIC_2,
}

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, masterchef, chainBlocks.cronos, "cronos", addr=>{
        addr = addr.toLowerCase();
        if (translate[addr] !== undefined) {
            return translate[addr]
        }
        return `cronos:${addr}`
    }, undefined, [bird], true, true, bird);
    return balances;
}

module.exports = {
    cronos: {
        tvl,
        staking: stakingUnknownPricedLP(masterchef, bird, "cronos", "0xa970c3B154dE5dbf0054f3dBF18AE2f92Fb937ae"),
        pool2: pool2BalanceFromMasterChefExports(masterchef, bird, "cronos", addr=>`cronos:${addr}`)
    }
}