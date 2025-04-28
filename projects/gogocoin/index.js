const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const {
    pool2
} = require('../helper/pool2');

const USDC_POOL_STAKING_CONTRACT = '0x7FCf0f2dcEc385FCCEd98240A8A4bEC8e91da7D1'
const GOVERNANCE_STAKING_CONTRACT = '0xd46206003FfB72Fe5FEB04373328C62e2bF864f9'
const LP_TOKEN_USDC = '0xe33Dd0C0534189b66B9872425189399e2B9c169D'
const LP_STAKING_CONTRACT = '0x5dc4ffc0f9c2261dcaae7f69e1a8837afbd577bc'
const GOGOCOIN = '0xdD2AF2E723547088D3846841fbDcC6A8093313d6'
const USDC = ADDRESSES.polygon.USDC
const chain = 'polygon'

async function chainTVL(timestamp, block, chainBlocks) {
    const balances = {}
    const transform = i => `polygon:${i}`;

    const USDCPool = await sdk.api.abi.call({
        target: USDC_POOL_STAKING_CONTRACT,
        abi: "uint256:totalSupply",
        chain: chain,
        block: chainBlocks[chain]
    })

    sdk.util.sumSingleBalance(balances, transform(USDC), USDCPool.output)
    return balances
}

async function stakingX(timestamp, block, chainBlocks) {
    const balances = {}
    const transform = i => `polygon:${i}`;

    const totalGOGOLocked = await sdk.api.abi.call({
        target: GOVERNANCE_STAKING_CONTRACT,
        abi: "uint256:getTotalLockedGogo",
        chain: chain,
        block: chainBlocks[chain]
    })

    sdk.util.sumSingleBalance(balances, transform(GOGOCOIN), totalGOGOLocked.output)

    return balances
}

async function pool2X(...args) {
    const transform = i => `polygon:${i}`;
    return pool2(LP_STAKING_CONTRACT, LP_TOKEN_USDC, chain, transform)(...args)
}

module.exports = {
        start: '2021-12-01',
    polygon: {
        staking: stakingX,
        pool2: pool2X,
        tvl: chainTVL,
    },
    methodology: "We count liquidity that it is in our USDC-GOGO Liquidity Pool, we also count the total locked USDC in our USDC Staking contract and we count the numbers of GOGOs staked in our GOGO Staking contract.",
}