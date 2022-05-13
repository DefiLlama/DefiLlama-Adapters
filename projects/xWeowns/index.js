const sdk = require("@defillama/sdk");

const abi = {
    "name": "exactPeggedAmount",
    "type": "function",
    "inputs": [],
    "outputs": [
        {
            "name": "",
            "type": "uint256",
            "internalType": "uint256"
        }
    ],
    "stateMutability": "view"
}

const contracts = {
    "xWeowns": "0xaBA0Bb586335B938a7a817A900017D891268d32c"
};
const xWeowns = "0x53f5f2D63999C497ac7bD996E59145BA588f16fD"

async function tvl(timestamp, block, chainBlocks) {
    // console.log("abi:: ", abi)
    const balances = {};

    const supplies = (await sdk.api.abi.multiCall({
        calls: Object.values(contracts).map((c) => ({
            target: c
        })),
        abi: 'erc20:totalSupply',
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output[0].output;

    console.log("supplies:: ", supplies)

    const decimals = (await sdk.api.abi.multiCall({
        calls: Object.values(contracts).map((c) => ({
            target: c
        })),
        abi: 'erc20:decimals',
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output[0].output;

    console.log("decimals:: ", decimals)

    const pegged = (await sdk.api.abi.multiCall({
        calls: Object.values(contracts).map((c) => ({
            target: c
        })),
        abi: abi,
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output[0].output;

    console.log("pegged:: ", pegged)

    sdk.util.sumSingleBalance(balances, `lachain:${xWeowns}`, supplies);
    

    // for (let i = 0; i < Object.keys(contracts).length; i++) {
        
    //     // console.log("supplies:: ", pegged[i].output)

    //     sdk.util.sumSingleBalance(
    //         balances, 
    //         Object.keys(contracts)[i], 
    //         supplies[i].output / 10 ** decimals[i].output
    //         );
    // };

    console.log("balances:: ", balances)

    return balances;
};

module.exports = {
    lachain: {
        tvl
    }
};