const { transformBscAddress, transformFantomAddress 
    } = require('./helper/portedTokens');
const { unwrapUniswapLPs } = require('./helper/unwrapLPs');
const sdk = require('@defillama/sdk');

async function bsc(timestamp, ethBlock, chainBlocks) {
    const transform = await transformBscAddress();
    const atmosToken = 'bsc:0xc53c65c4a925039cc149fa99fd011490d40270a3';
    const pools = [{
        'pool2Address': '0xaF18cde26fdd22561df2a02958CbA092f41875d8',
        'pairToken': 'bsc:0x55d398326f99059ff775485246999027b3197955',
        'stakingContract': '0x282FFbE782F903340A14955649032302e8020b9C'  
    },{
        'pool2Address': '0xdf825e486d9d15848a36c113b7725d7923e886a4',
        'pairToken': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        'stakingContract': '0xa65d60e8a71dBDbb14B6eE7073522546FE73CFE4' 
    }];
    let balances = {};

    for (const pool of pools) {
        let balance = ((await sdk.api.abi.call({
            chain: 'bsc',
            block: chainBlocks['bsc'],
            target: pool.pool2Address,
            abi: 'erc20:balanceOf',
            params: pool.stakingContract
        })).output);

        await unwrapUniswapLPs(
            balances,
            [{balance: balance, token: pool.pool2Address}],
            chainBlocks['bsc'],
            'bsc',
            transform
        );
        //because atmos token isnt on coingecko
        delete balances[atmosToken];
        balances[pool.pairToken] *= 2;
    };
    return balances;
};
async function ftm(timestamp, ethBlock, chainBlocks) {
    const transform = await transformFantomAddress();
    const atmosToken = 'fantom:0xfc74d58550485e54dc3a001f6f371741dceea094';
    const pools = [{
        'pool2Address': '0x662db0c6fa77041fe4901149558cc70ca1c8e874',
        'pairToken': '0x4e15361fd6b4bb609fa63c81a2be19d873717870',
        'stakingContract': 'f043f876d3d220acce029ca76c9572f0449e5e71'  
    }];
    let balances = {};

    for (const pool of pools) {
        let balance = ((await sdk.api.abi.call({
            chain: 'fantom',
            block: chainBlocks['fantom'],
            target: pool.pool2Address,
            abi: 'erc20:balanceOf',
            params: pool.stakingContract
        })).output);

        await unwrapUniswapLPs(
            balances,
            [{balance: balance, token: pool.pool2Address}],
            chainBlocks['fantom'],
            'fantom',
            transform
        )
        // because atmos token isnt on coingecko
        delete balances[atmosToken];
        balances[pool.pairToken] *= 2;
    };
    return balances;
};

module.exports = {
    misrepresentedTokens: true,
    fantom: {
        pool2: ftm,
    },
    bsc: {
        pool2: bsc
    },
};