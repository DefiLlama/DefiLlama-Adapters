const sdk = require("@defillama/sdk");
const {addFundsInMasterChef} = require("../helper/masterchef");
const token = "0x5CA42204cDaa70d5c773946e69dE942b85CA6706";
const masterchef = "0x0C54B0b7d61De871dB47c3aD3F69FEB0F2C8db0B";

async function tvl(timestamp, chain, chainBlocks) {
    let balances = {};
    await addFundsInMasterChef(balances, masterchef, chainBlocks.bsc, "bsc", addr=>`bsc:${addr}`);
    return balances;
}

async function staking(timestamp, chain, chainBlocks) {
    let balances = {};
    let stakingBalance = (await sdk.api.erc20.balanceOf({
        target: token,
        owner: masterchef,
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;
    sdk.util.sumSingleBalance(balances, `bsc:${token}`, stakingBalance);
    return balances;
}

module.exports = {
    bsc: {
        tvl,
        staking
    },
    tvl
}