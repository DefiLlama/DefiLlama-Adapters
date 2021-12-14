const { transformPolygonAddress } = require('./helper/portedTokens');
const sdk = require('@defillama/sdk');
const { getBlock } = require('./helper/getBlock');
const { pool2 } = require('./helper/pool2');

const contracts = [
    '0x151757c2E830C467B28Fe6C09c3174b6c76aA0c5',
    '0x203F5c9567d533038d2da70Cbc20e6E8B3f309F9',
    '0x176586Dec2b70df5B72a6Efe158a87f210551798',
    '0xaee4d11a16B2bc65EDD6416Fb626EB404a6D65BD'
];

const tokens = {
    DAI: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    dQUICK: '0xf28164a485b0b2c90639e47b0f377b4a438a16b1'
};

async function tvl(timestamp, block, chainBlocks) {
    const transform = await transformPolygonAddress();
    const balances = {};
    block = await getBlock(timestamp, 'polygon', chainBlocks);

    const DAIbalance = (await sdk.api.abi.multiCall({
        calls: contracts.map((c) => ({
            target: tokens.DAI,
            params: c
        })),
        abi: "erc20:balanceOf",
        block,
        chain: 'polygon'
    })).output.reduce((a, b) => Number(a) + Number(b.output), 0);

    const dQUICKbalance = (await sdk.api.abi.multiCall({
        calls: contracts.map((c) => ({
            target: tokens.dQUICK,
            params: c
        })),
        abi: "erc20:balanceOf",
        block,
        chain: 'polygon'
    })).output.reduce((a, b) => Number(a) + Number(b.output), 0);

    return {
        [transform(tokens.DAI)]: DAIbalance,
        [transform(tokens.dQUICK)]: dQUICKbalance
    };
};

// node test.js projects/gainsNetwork.js
module.exports={
    polygon: {
        tvl,
        pool2: pool2(
            '0x33025b177A35F6275b78f9c25684273fc24B4e43', 
            '0x6e53cb6942e518376e9e763554db1a45ddcd25c4', 
            'polygon')
    }
};