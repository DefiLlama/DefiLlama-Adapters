const sdk = require('@defillama/sdk');
const addresses = require('./address.json')['LUNA'];
const { getTokenSupply } = require('../helper/solana');

// node test.js projects/stablesByChain/index.js
async function main(block, chain) {
    supplies = {};
    switch(chain) {
        case 'sol':
            for (const symbol of Object.keys(addresses)) {
                await getTokenSupply(addresses[symbol]).then(
                    supply => Object.assign(supplies, {[symbol]: supply})
                )
            }
            break;
        case 'ethereum' || 'bsc' || 'polygon' || 'heco' || 'fantom' || 
             'axax' || 'polygon':
            for (const symbol of Object.keys(addresses)) {
                await sdk.api.erc20.totalSupply({
                    target: addresses[symbol],
                    block: block,
                    chain: chain
                }).then(supply =>
                    Object.assign(supplies, {[symbol]: supply.output}))
            }
            break;
        case 'terra':
            break
    };
    console.log(supplies)
};
async function test(block) {
    // supplies = {}
    // for (const symbol of Object.keys(addresses)) {
    //     await getTokenSupply(addresses[symbol]).then(
    //         supply => Object.assign(supplies, {[symbol]: supply})
    //     )
    // }
};
async function tvl(timestamp, block) {
    await test(block, 'bsc')
};
module.exports = {
    tvl
};