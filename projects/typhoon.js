const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const tornado = '0x9cDb933eDab885bB767658B9ED5C3800bc1d761B';
const reserve = '0xC9B4Dff1ce5384C7014579099e63EA0092e14eD5';
const weth = ADDRESSES.ethereum.WETH;

async function tvl(timestamp, block) {
    return { [weth] : Number((await sdk.api.eth.getBalance({
        target: tornado, 
        block
    })).output) + Number((await sdk.api.eth.getBalance({
        target: reserve, 
        block
    })).output)};
}

module.exports = {
    ethereum: {
        tvl
    }
};