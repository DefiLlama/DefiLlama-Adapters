const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const savaxAbi = require("./savax.json");

const SAVAX = "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE";
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
