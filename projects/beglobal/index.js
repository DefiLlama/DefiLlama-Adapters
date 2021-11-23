const sdk = require("@defillama/sdk");
const {addFundsInMasterChef} = require("../helper/masterchef");

const token = "0xcF958B53EC9340886d72bb4F5F2977E8C2aB64D3";
const masterchef = "0x7883aD0e83ce50f4820a862EdB56f756599A3248";

async function tvl(timestamp, chain, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, masterchef, chainBlocks.bsc, "bsc", addr=>`bsc:${addr}`, undefined, [token]);
    return balances;
}

async function staking(timestamp, chain, chainBlocks) {
    let balances = {};
    let balance = (await sdk.api.erc20.balanceOf({
        target: token,
        owner: masterchef,
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;
    sdk.util.sumSingleBalance(balances, `bsc:${token}`, balance);
    return balances;
}

module.exports = {
    bsc: {
        tvl,
        staking
    }
}