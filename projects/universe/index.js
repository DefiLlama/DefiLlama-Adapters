const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

const STAKING_ADDRESS = '0x2d615795a8bdb804541C69798F13331126BA0c09';

const USDC_TOKEN = {
    symbol: 'USDC',
    address: ADDRESSES.ethereum.USDC,
    decimals: 6,
};

const AAVE_TOKEN = {
    symbol: 'AAVE',
    address: ADDRESSES.ethereum.AAVE,
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
    address: ADDRESSES.ethereum.SNX,
    decimals: 18,
};

const SUSHI_TOKEN = {
    symbol: 'SUSHI',
    address: ADDRESSES.ethereum.SUSHI,
    decimals: 18,
};

const LINK_TOKEN = {
    symbol: 'LINK',
    address: ADDRESSES.ethereum.LINK,
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
    start: '2021-05-25', // May-25-2021 10:39:49 AM +UTC
};