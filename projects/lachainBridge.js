const sdk = require("@defillama/sdk");
const contracts = {
    "binancecoin": "0x9483bDd8e088a2241f20F9241eFa3e3F6288ee20",
    "matic-network": "0xC9AE905f288A3A3591CA7eee328eEd1568C14F32",
    "ethereum": "0x5ce9084e8ADa946AF09200c80fbAbCb1245E477F",
    "avalanche-2": "0x690594910c2d58869d5F3FF205ebA1ff2A1B8245",
    "fantom": "0x8c2E35a5825Ab407d2718402D15fFa8ec6D19acf",
    "harmony": "0xC224866E0d39AC2d104Dd28F6398F3548ae0f318"
};

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};

    const supplies = (await sdk.api.abi.multiCall({
        calls: Object.values(contracts).map((c) => ({
            target: c
        })),
        abi: "erc20:totalSupply",
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output;

    const decimals = (await sdk.api.abi.multiCall({
        calls: Object.values(contracts).map((c) => ({
            target: c
        })),
        abi: "erc20:decimals",
        block: chainBlocks.lachain,
        chain: 'lachain'
    })).output;

    for (let i = 0; i < Object.keys(contracts).length; i++) {
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