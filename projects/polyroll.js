const { sumTokensAndLPsSharedOwners } = require('./helper/unwrapLPs');
const { getBlock } = require('./helper/getBlock');
const { transformPolygonAddress } = require('./helper/portedTokens');

const tokens = [
    ['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', false], //WMATIC
    ['0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', false], //WETH
    ['0xc2132d05d31c914a87c6611c10748aeb04b58e8f', false], //USDT
    ['0x831753dd7087cac61ab5644b308642cc1c33dc13', false] //QUICK
];
const fundedContracts = [
    '0x3C58EA8D37f4fc6882F678f822E383Df39260937', //masterchef
    '0xc7F4F97E710C2d87F29f6F03220a3425064e02E5', //prize
    '0xa3541eA15556AD3272b9BDe36241F61cCbb60aE8', //staking pool
    '0x6A974e96a963e9f219915797C4E3B9e2A63ab0e2', //roll
    '0xC96D9032770010f5f3D167cA4eeca84a0Bca0Fa2'  //miner
];
async function tvl(timestamp, block, chainBlocks) {
    const transform = await transformPolygonAddress();
    const balances = {};
    block = await getBlock(timestamp, "polygon", chainBlocks);

    await sumTokensAndLPsSharedOwners(
        balances, 
        tokens, 
        fundedContracts, 
        block, 
        'polygon', 
        transform
        );

    return balances;
};
async function staking(timestamp, block, chainBlocks) {
    const transform = await transformPolygonAddress();
    const balances = {};
    block = await getBlock(timestamp, "polygon", chainBlocks);

    await sumTokensAndLPsSharedOwners(
        balances, 
        [['0xc68e83a305b0fad69e264a1769a0a070f190d2d6', false]], 
        fundedContracts, 
        block, 
        'polygon', 
        transform
        );

    return balances;
};
// node test.js projects/polyroll.js
module.exports={
    polygon: {
        tvl,
        staking
    }
}