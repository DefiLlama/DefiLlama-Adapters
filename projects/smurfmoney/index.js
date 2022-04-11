const { addFundsInMasterChef } = require("../helper/masterchef");

const clever = "0x465bc6d1ab26efa74ee75b1e565e896615b39e79";
const mushy = "0x53a5f9d5adc34288b2bff77d27f55cbc297df2b9";
const clevermasterchef = "0x772dEC3e4A9B18e3B2636a70e11e4e0a90F19575";
const mushymasterchef = "0xdD4Ddef5be424a6b5645dF4f5169e3cbA6a975Db";

async function tvl (timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, clevermasterchef, chainBlocks.fantom, "fantom", addr=>`fantom:${addr}`, undefined, [mushy, clever], true, true, clever);
    await addFundsInMasterChef(balances, mushymasterchef, chainBlocks.fantom,  "fantom", addr=>`fantom:${addr}`, undefined, [mushy, clever], true, true, mushy);
    balances["0x6b175474e89094c44da98b954eedeac495271d0f"] = balances["fantom:0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E"];
    delete balances["fantom:0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E"];
    return balances;
}

module.exports = {
    fantom: {
        tvl
    }
}