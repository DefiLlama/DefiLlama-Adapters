const sdk = require("@defillama/sdk");
const sTlosAbi = require("./sTlos.json");
const { ethers } = require("ethers");

const sTLOS = "0xb4b01216a5bc8f1c8a33cd990a1239030e60c905";

async function tvl(timestamp, block, chainBlocks) {
    const pooledTLOS = await sdk.api.abi.call({
        target: sTLOS,
        abi: sTlosAbi.totalAssets,
        chain: "telos",
    });
    
    return {
        telos: ethers.utils.formatEther(pooledTLOS.output)
    };
}

module.exports={
    avax:{
        tvl,
    },
    methodology: "Counts staked TLOS tokens.",
}