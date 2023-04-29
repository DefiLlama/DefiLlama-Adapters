const ADDRESSES = require('../helper/coreAssets.json')
const { addFundsInMasterChef } = require("../helper/masterchef");

const clever = "0x465bc6d1ab26efa74ee75b1e565e896615b39e79";
const mushy = "0x53a5f9d5adc34288b2bff77d27f55cbc297df2b9";
const clevermasterchef = "0x772dEC3e4A9B18e3B2636a70e11e4e0a90F19575";
const mushymasterchef = "0xdD4Ddef5be424a6b5645dF4f5169e3cbA6a975Db";

async function tvl (timestamp, block, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, clevermasterchef, chainBlocks.fantom, "fantom", addr=>`fantom:${addr}`, undefined, [mushy, clever], true, true, clever);
    await addFundsInMasterChef(balances, mushymasterchef, chainBlocks.fantom,  "fantom", addr=>`fantom:${addr}`, undefined, [mushy, clever], true, true, mushy);
    balances[ADDRESSES.ethereum.DAI] = balances["fantom:" + ADDRESSES.fantom.DAI];
    delete balances["fantom:" + ADDRESSES.fantom.DAI];
    return balances;
}

module.exports = {
    fantom: {
        tvl
    }
}