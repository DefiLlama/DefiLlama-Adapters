const BigNumber = require("bignumber.js");
const sdk = require('@defillama/sdk');
const { getBlock } = require('./helper/getBlock');

const TREEB = 'fantom:0xc60d7067dfbc6f2caf30523a064f416a5af52963';
const contracts = [
    '0x669b6723D8cf1cE664bc1005646a26Dc8563E5C7', // QUICK
    '0x39985D64b122f9089340CF1ab39D756e3cA74F0f', // MID
    '0x5fA057966fB12c9e89bF603661CE3133bD3CBf8B',  // DEEP
    '0x5C6f3A0d2a8A921Fa473a22C71a84504b43c0DA6',  // AMBER
    '0xB767C1fAcA04DD9eaBE20e307C52E81c37Bfb1a1',  // CARBON
    '0x326b7cCcBA7370fAd44a7CE82bee71B6504576B0',  // MINERAL
    '0x6A45918D754b167d3E492A10A6DDf81e6C24E455'   // SECRET
];

async function staking(timestamp, block, chainBlocks) {
    block = await getBlock(timestamp, 'fantom', chainBlocks);

    const balance = (await sdk.api.abi.multiCall({
        calls: contracts.map((c) => ({
            target: '0xc60d7067dfbc6f2caf30523a064f416a5af52963',
            params: c
        })),
        abi: 'erc20:balanceOf',
        block,
        chain: 'fantom'
    })).output
        .map(i => i.output)
        .reduce((a, b) => new BigNumber(a).plus(b));

    return { [TREEB]: balance };
};

module.exports = {
    fantom: {
        staking,
        tvl: async() => ({})
    }
};
