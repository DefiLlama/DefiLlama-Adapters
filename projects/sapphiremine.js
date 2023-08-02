const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const target = '0x7146854856E3f373675105556c7D964B329606be';
const WMATIC = ADDRESSES.polygon.WMATIC_2;

async function tvl(timestamp, block, chainBlocks) {
    return { [ `polygon:${WMATIC}` ]: 
        (await sdk.api.eth.getBalance({ 
            target, 
            block: chainBlocks.polygon, 
            chain: 'polygon' 
        })).output 
    };
}

module.exports = {
    polygon: {
        tvl
    }
};