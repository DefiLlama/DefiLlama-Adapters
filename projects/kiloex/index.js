const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const abi = require("./abi.json");

const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
const vaultAddress = "0x1c3f35F7883fc4Ea8C4BCA1507144DC6087ad0fb";
const marginAddress = "0xfE03be1b0504031e92eDA810374222c944351356";
const ETHER = new BigNumber(10).pow(18);

async function bscTvl(timestamp, block, chainBlocks) {
    const valueBalance = (await sdk.api.abi.call({
        target: usdtAddress,
        params: vaultAddress,
        abi: abi.balanceOf,
        block: chainBlocks['bsc'],
        chain: "bsc"
    })).output;
    const vault = new BigNumber(valueBalance).dividedBy(ETHER).toNumber();

    const marginBalance = (await sdk.api.abi.call({
        target: usdtAddress,
        params: marginAddress,
        abi: abi.balanceOf,
        block: chainBlocks['bsc'],
        chain: "bsc"
    })).output;
    const margin = new BigNumber(marginBalance).dividedBy(ETHER).toNumber();
    return vault + margin;
}

module.exports = {
    timetravel: false,
    methodology: "Calculate kiloex vault tvl.",
    bsc: {
        tvl: bscTvl,
    },
};