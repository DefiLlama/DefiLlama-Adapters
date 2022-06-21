const {addFundsInMasterChef} = require("../helper/masterchef");
const {stakingUnknownPricedLP} = require("../helper/staking");
const {pool2BalanceFromMasterChefExports} = require("../helper/pool2");

const bird = "0x9A3d8759174f2540985aC83D957c8772293F8646";
const masterchef = "0xDF937094C6f2B757Dfd1265e5e1550Ea0055b27A";

const translate = {
    "0xbed48612bc69fa1cab67052b42a95fb30c1bcfee": "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
    "0x765277eebeca2e31912c9946eae1021199b39c61": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    "0xb44a9b6905af7c801311e8f4e76932ee959c663c": "fantom:0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    "0x9b8077c6590b560f1a9d60512648277d29b35a3b": "polygon:0x8a953cfe442c5e8855cc6c61b1293fa648bae472",
    "0xc9baa8cfdde8e328787e29b4b078abf2dadc2055": "polygon:0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
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