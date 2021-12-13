const sdk = require("@defillama/sdk");
const { addFundsInMasterChef } = require("../helper/masterchef.js");
const abi = require("../helper/abis/masterchef.json");

const anchorToken = "0x4aac18De824eC1b553dbf342829834E4FF3F7a9F";
const masterchef = "0x23f7F3119d1b5b6c94a232680e2925703C4ebbF5";

async function tvl(timestamp, chain, chainBlocks) {
    let balances = {};

    await addFundsInMasterChef(balances, masterchef, chainBlocks.bsc, "bsc", addr=>`bsc:${addr}`, abi.poolInfo, [anchorToken], true);

    return balances;
}

async function staking(timestamp, chain, chainBlocks) {
    let balances = {};

    let { output: balance } = await sdk.api.erc20.balanceOf({
        target: anchorToken,
        owner: masterchef,
        block: chainBlocks.bsc,
        chain: "bsc"
    });

    sdk.util.sumSingleBalance(balances, `bsc:${anchorToken}`, balance);

    return balances;
}


module.exports = {
    bsc: {
        tvl,
        staking
    },
    
}