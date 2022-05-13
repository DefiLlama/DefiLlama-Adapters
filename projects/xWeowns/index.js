const sdk = require("@defillama/sdk");
const abi = require('./abi.json');


const contracts = {
    "xWeowns": "0xaBA0Bb586335B938a7a817A900017D891268d32c"
};

async function tvl(timestamp, block, chainBlocks) {
    // console.log("abi:: ", abi)
    const balances = {};

    const supplies = (await sdk.api.abi.multiCall({
        calls: Object.values(contracts).map((c) => ({
            target: c
        })),
        abi: abi.totalSupply,
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output;

    console.log("print lol")

    // const decimals = (await sdk.api.abi.multiCall({
    //     calls: Object.values(contracts).map((c) => ({
    //         target: c
    //     })),
    //     abi: abi.decimals,
    //     block: chainBlocks.lachain,
    //     chain: 'lachain'
    // })).output;

    // const pegged = (await sdk.api.abi.multiCall({
    //     calls: Object.values(contracts).map((c) => ({
    //         target: c
    //     })),
    //     abi: abi.exactPeggedAmount,
    //     block: chainBlocks.lachain,
    //     chain: 'lachain'
    // })).output;

    // for (let i = 0; i < Object.keys(contracts).length; i++) {
        
    //     console.log("supplies:: ", pegged[i].output)

    //     sdk.util.sumSingleBalance(
    //         balances, 
    //         Object.keys(contracts)[i], 
    //         supplies[i].output / 10 ** decimals[i].output
    //         );
    // };

    return balances;
};

module.exports = {
    lachain: {
        tvl
    }
};