const sdk = require('@defillama/sdk');
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

const STAKING_ADDRESS = '0x2d615795a8bdb804541C69798F13331126BA0c09';

const USDC_TOKEN = {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
};

const AAVE_TOKEN = {
    symbol: 'AAVE',
    address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    decimals: 18,
};

const BOND_TOKEN = {
    symbol: 'BOND',
    address: '0x0391d2021f89dc339f60fff84546ea23e337750f',
    decimals: 18,
};

const COMP_TOKEN = {
    symbol: 'COMP',
    address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    decimals: 18,
};

const SNX_TOKEN = {
    symbol: 'SNX',
    address: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
    decimals: 18,
};

const SUSHI_TOKEN = {
    symbol: 'SUSHI',
    address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    decimals: 18,
};

const LINK_TOKEN = {
    symbol: 'LINK',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    decimals: 18,
};

const ILV_TOKEN = {
    symbol: 'ILV',
    address: '0x767fe9edc9e0df98e07454847909b5e959d7ca0e',
    decimals: 18,
};

const USDC_XYZ_SUSHI_LP_TOKEN = {
    symbol: 'USDC_XYZ_SUSHI_LP',
    address: '0xbbbdb106a806173d1eea1640961533ff3114d69a',
    decimals: 18,
};

// Unused but will leave it because they added it to the PR
function createAbiViewItemFor(name, inputs, outputs) {
    return {
        name,
        type: 'function',
        stateMutability: 'view',
        inputs: inputs.map(input => ({
            name: '',
            type: input,
        })),
        outputs: outputs.map(output => ({
            name: '',
            type: output,
        })),
    };
}

async function pool2(_timestamp, block) {
    const balance = await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        target: USDC_XYZ_SUSHI_LP_TOKEN.address,
        params: [STAKING_ADDRESS],
        block,
    }).then(({output}) => output);

    const balances = {}
    await unwrapUniswapLPs(balances, [{
        token: USDC_XYZ_SUSHI_LP_TOKEN.address,
        balance: balance
    }], block)
    return balances
}

async function tvl(timestamp, block) {
    const balances = {};

    const tokenBalances = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: [AAVE_TOKEN, BOND_TOKEN, COMP_TOKEN, ILV_TOKEN, LINK_TOKEN, SNX_TOKEN, SUSHI_TOKEN].map(token => ({
            target: token.address,
            params: [STAKING_ADDRESS],
        })),
        block,
    });

    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true);

    return balances;
}

module.exports = {
    methodology: 'TVL counts tokens that have been deposited to the yield farming vaults. Pool2 TVL counts SushiSwap LP tokens (USDC-XYZ) that have been deposited to the yield farm.',
    ethereum:{
        tvl,
        pool2,
    },
    start: 1621939189, // May-25-2021 10:39:49 AM +UTC
};