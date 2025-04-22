const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const savaxAbi = require("./savax.json");

const SAVAX = ADDRESSES.avax.SAVAX;
const WAVAX = ADDRESSES.avax.WAVAX;

const transformAddress = (addr) => `avax:${addr}`;

async function tvl(timestamp, block, chainBlocks) {
    const pooledAvax = await sdk.api.abi.call({
        target: SAVAX,
        abi: savaxAbi.totalPooledAvax,
        chain: "avax",
        block: chainBlocks.avax,
    });
    
    return {
        [transformAddress(WAVAX)]: pooledAvax.output
    };
}

module.exports={
    avax:{
        tvl,
    },
    methodology: "Counts staked AVAX tokens.",
    hallmarks:[
      [1643199567, "Benqi SAVAX Launched"]
    ],
}
