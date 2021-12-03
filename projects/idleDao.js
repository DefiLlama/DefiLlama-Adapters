
const sdk = require('@defillama/sdk');
const { getBlock } = require('./helper/getBlock');
const { transformPolygonAddress } = require('./helper/portedTokens');

const vaults = [
    { 
        address: '0x8a999F5A3546F8243205b2c0eCb0627cC10003ab', // IdleDAI
        tokens: [
            '0x27f8d03b3a2196956ed754badc28d73be8830a6e', // amDAI
            '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
            '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // wMATIC
        ]
    }, {
        address: '0x1ee6470CD75D5686d0b2b90C0305Fa46fb0C89A1', // IdleUSDC
        tokens: [
            '0x1a13f4ca1d028320a707d99520abfefca3998b7f', // amUSDC
            '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
            '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // wMATIC
        ]
    }, {
        address: '0xfdA25D931258Df948ffecb66b5518299Df6527C4', // IdleWETH
        tokens: [
            '0x28424507fefb6f7f8e9d3860f56504e4e5f5f390', // amWETH
            '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
            '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // wMATIC
        ]
    }
];

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    block = await getBlock(timestamp, 'polygon', chainBlocks);
    const transform = await transformPolygonAddress();
    
    for (let vault of vaults) {
        const balanceOfs = (await sdk.api.abi.multiCall({
            calls: vault.tokens.map(c => ({
                target: c,
                params: [vault.address]})),
            abi: 'erc20:balanceOf',
            block,
            chain: 'polygon'
        })).output;

        for (let i = 0; i < vault.tokens.length; i++) {
            await sdk.util.sumSingleBalance(
                balances, 
                transform(vault.tokens[i]), 
                balanceOfs[i].output
            );
        };
    };
    return balances;
};

module.exports = {
    polygon: {
        tvl
    }
};