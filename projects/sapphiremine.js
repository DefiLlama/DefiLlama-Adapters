const sdk = require("@defillama/sdk");
const target = '0x7146854856E3f373675105556c7D964B329606be';
const WMATIC = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270';

async function tvl(timestamp, block, chainBlocks) {
    return { [ `polygon:${WMATIC}` ]: 
        (await sdk.api.eth.getBalance({ 
            target, 
            block: chainBlocks.polygon, 
            chain: 'polygon' 
        })).output 
    };
};

module.exports = {
    polygon: {
        tvl
    }
};