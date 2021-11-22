const sdk = require("@defillama/sdk");
const {addFundsInMasterChef} = require("../helper/masterchef");
const token = "0x5CA42204cDaa70d5c773946e69dE942b85CA6706";
const masterchef = "0x0C54B0b7d61De871dB47c3aD3F69FEB0F2C8db0B";
const treasuryAddress = "0xF7224c91BaF653ef46F498a92E2FFF35Ad0588a2";
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

async function treasury(timestamp, chain, chainBlocks) {
    let balances = {};
    let posiBalance = (await sdk.api.erc20.balanceOf({
        target: token,
        owner: treasuryAddress,
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output
    sdk.util.sumSingleBalance(balances, `bsc:${token}`, posiBalance);
    return balances;
}

module.exports = {
    methodolgy: "TVL is calculated by value locked in MasterChef contract and treasury value is the POSI in the treasury contract.",
    bsc: {
        tvl,
        staking,
        treasury
    },
    tvl
}