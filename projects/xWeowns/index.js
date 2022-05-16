const sdk = require("@defillama/sdk");
const abi = require('./abi2.json');


const contracts = {
    "xWeowns": "0xaBA0Bb586335B938a7a817A900017D891268d32c"
};
// node test.js projects/xWeowns/index.js
async function tvl(timestamp, block, chainBlocks) {
    const balances = {};

    const supplies = (await sdk.api.abi.multiCall({
        calls: Object.values(contracts).map((c) => ({
            target: c
        })),
        abi: 'erc20:totalSupply',
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output;

    const decimals = (await sdk.api.abi.multiCall({
        calls: Object.values(contracts).map((c) => ({
            target: c
        })),
        abi: 'erc20:decimals',
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output;

    const pegged = (await sdk.api.abi.multiCall({
        calls: Object.values(contracts).map((c) => ({
            target: c
        })),
        abi: abi.exactPeggedAmount,
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output;

    for (let i = 0; i < Object.keys(contracts).length; i++) {
        
        console.log("supplies:: ", pegged[i].output)

        sdk.util.sumSingleBalance(
            balances, 
            Object.keys(contracts)[i], 
            supplies[i].output / 10 ** decimals[i].output
            );
    };

    return balances;
};

module.exports = {
    lachain: {
        tvl
    }
};