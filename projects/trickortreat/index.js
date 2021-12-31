const sdk = require("@defillama/sdk");
const {addFundsInMasterChef} = require("../helper/masterchef");
const {pool2BalanceFromMasterChefExports} = require("../helper/pool2");
const {staking} = require("../helper/staking");

const masterchef = "0x2755AC6BD7BDbaCbdE08504f45f73D150Ee660F5";
const trick = "0xA5aFce54270D9afA6a80464bBD383BE506888e6A";

const translate = {
    "fantom:0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E": "0x6b175474e89094c44da98b954eedeac495271d0f",
    "fantom:0xb3654dc3D10Ea7645f8319668E8F54d2574FBdC8": "0x514910771af9ca656af840dff83e8264ecf986ca"
}

const wMEMO = "0x0da67235dd5787d67955420c84ca1cecd4e5bb3b"
const time = "avax:0xb54f16fb19478766a268f172c9480f8da1a7c9c3";

const wsSPA= "0x89346b51a54263cf2e92da79b1863759efa68692";
const spa = "fantom:0x5602df4a94eb6c680190accfa2a475621e0ddbdc";

async function tvl (timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, masterchef, chainBlocks.fantom, "fantom", addr=>`fantom:${addr}`, undefined, [trick], true, true, trick);
    for (let key in translate) {
        balances[translate[key]] = balances[key];
        delete balances[key]
    }
    const memo = (await sdk.api.abi.call({
        target: wMEMO,
        params: [balances["fantom:0xDDc0385169797937066bBd8EF409b5B3c0dFEB52"]],
        abi:{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"wMEMOToMEMO","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},        block,
        chainBlocks: chainBlocks.avax,
        chain: "avax",
    })).output;
    balances[time] = memo
    delete balances["fantom:0xDDc0385169797937066bBd8EF409b5B3c0dFEB52"];
    const sSPA = (await sdk.api.abi.call({
        target: wsSPA,
        params:[balances["fantom:0x89346B51A54263cF2e92dA79B1863759eFa68692"]],
        abi: {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"wOHMTosOHM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        chain: chainBlocks.fantom,
        chain: "fantom"
    })).output;
    balances[spa] = sSPA;
    delete balances["fantom:0x89346B51A54263cF2e92dA79B1863759eFa68692"];
    return balances;
}

module.exports = {
    fantom: {
        tvl,
        pool2: pool2BalanceFromMasterChefExports(masterchef, trick, "fantom", addr=>`fantom:${addr}`),
        staking: staking(masterchef, trick, "fantom")
    }
}