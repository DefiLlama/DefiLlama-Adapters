const sdk = require("@defillama/sdk");
const savaxAbi = require("./savax.json");

const SAVAX = "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE";
const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";

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
    avalanche: {
        tvl,
    },
    methodology: "Counts staked AVAX tokens.",
}
