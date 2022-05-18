const sdk = require('@defillama/sdk');
const _ = require('underscore');
const axios = require("axios");
const retry = require('async-retry')
const BigNumber = require("bignumber.js");
const { transformBscAddress } = require('../helper/portedTokens');


const poolContract = ['0xa0ee789a8f581cb92dd9742ed0b5d54a0916976c']
const treasureContract = ['0xe2e912f0b1b5961be7cb0d6dbb4a920ace06cd99']

const TOKEN_APX = '0x78f5d389f5cdccfc41594abab4b0ed02f31398b3'
const TOKEN_BSC_USD = '0x55d398326f99059fF775485246999027B3197955'
const TOKEN_BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
const TOKEN_CAKE = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'
const TOKEN_BABY = '0x53e562b9b7e5e94b81f10e96ee70ad06df3d2657'
const TOKEN_LEOS = '0x2c8368f8f474ed9af49b87eac77061beb986c2f1'

const Pool2tokens = [
    TOKEN_APX,
    TOKEN_BUSD,
];

const TreasureTokens = [
    TOKEN_BSC_USD,
    TOKEN_BUSD,
    TOKEN_CAKE,
    TOKEN_BABY,
    TOKEN_LEOS,
]

function merge(...map) {
    const result = {}
    map.forEach(i => {
        Object.keys(i).forEach(j => {
            if (result[j]) {
                result[j] = new BigNumber(Number(result[j])).plus(Number(i[j])).toNumber()
            } else {
                result[j] = Number(i[j])
            }
        })
    })
    return result
}

async function staking(timestamp, block, chainBlocks) {
    const balances = {};
    const transform = await transformBscAddress();
    let totalStaking = await retry(async bail => await axios.get('https://www.apollox.finance/bapi/futures/v1/public/future/stake/summary'))
    await sdk.util.sumSingleBalance(balances, transform(Pool2tokens[0]), new BigNumber(Number(totalStaking.data.data['totalAmount'])).shiftedBy(18).toNumber())
    return balances
}

async function pool2(timestamp, block, chainBlocks) {
    const transform = await transformBscAddress();
    let balanceOfCalls = [];
    _.forEach(poolContract, (contract) => {
        balanceOfCalls = [
            ...balanceOfCalls,
            ..._.map(Pool2tokens, (token) => ({
                target: token,
                params: contract
            }))
        ];
    });
    const balances = {};

    const balanceOfResult = (await sdk.api.abi.multiCall({
        chain: 'bsc',
        block: chainBlocks['bsc'],
        calls: balanceOfCalls,
        abi: 'erc20:balanceOf',
    }));
    await sdk.util.sumMultiBalanceOf(balances, balanceOfResult, true, transform)
    return balances
}

async function treasure(timestamp, block, chainBlocks) {
    const transform = await transformBscAddress();
    let balanceOfCalls = [];
    _.forEach(treasureContract, (contract) => {
        balanceOfCalls = [
            ...balanceOfCalls,
            ..._.map(TreasureTokens, (token) => ({
                target: token,
                params: contract
            }))
        ];
    });
    const balances = {};

    const balanceOfResult = (await sdk.api.abi.multiCall({
        chain: 'bsc',
        block: chainBlocks['bsc'],
        calls: balanceOfCalls,
        abi: 'erc20:balanceOf',
    }));
    await sdk.util.sumMultiBalanceOf(balances, balanceOfResult, true, transform)
    return balances
}

async function tvl(timestamp, block, chainBlocks) {
    const balancesStaking = await staking(timestamp, block, chainBlocks)
    const balancesPool2 = await pool2(timestamp, block, chainBlocks)
    const balancesTreasure = await treasure(timestamp, block, chainBlocks)

    return merge(balancesStaking, balancesPool2, balancesTreasure)

}


module.exports = {
    timetravel: false,
    start: 1640100600,  // 12/21/2021 @ 15:30pm (UTC)
    bsc: { tvl },
};