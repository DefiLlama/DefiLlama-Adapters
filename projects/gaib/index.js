const ADDRESSES = require('../helper/coreAssets.json')
const mainnetContracts = {
    ethereum: [
        {
            token: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42', // USDC
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42' // AIDollarAlphaUSDC Pool
        },
        {
            token: '0xDc45e7027A0489FE6C2E4A0735097d8E6952A340', // USDT
            poolToken: '0xDc45e7027A0489FE6C2E4A0735097d8E6952A340' // AIDollarAlphaUSDT Pool
        },
        {
            token: '0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110', // USR
            poolToken: '0x5D976F56343e33A6a4d6e26AF7d59358d1359dd4' // AIDollarAlphaUSR Pool
        },
        {
            token: '0xaD55aebc9b8c03FC43cd9f62260391c13c23e7c0', // CUSDO
            poolToken: '0x17D02bCA29BD9E8cF4A39B25C9C902e6bF00AA54' // AIDollarAlphaCUSDO Pool
        }
    ],
    arbitrum: [
        {
            token: ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42' // AIDollarAlphaUSDC Pool
        },
        {
            token: ADDRESSES.arbitrum.USDT, // USDT
            poolToken: '0xDc45e7027A0489FE6C2E4A0735097d8E6952A340' // AIDollarAlphaUSDT Pool
        }
    ],
    base: [
        {
            token: ADDRESSES.base.USDC, // USDC
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42' // AIDollarAlphaUSDC Pool
        }
    ],
    sei: [
        {
            token: '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392', // USDC
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42' // AIDollarAlphaUSDC Pool
        },
        {
            token: '0x9151434b16b9763660705744891fA906F660EcC5', // USDT
            poolToken: '0xDc45e7027A0489FE6C2E4A0735097d8E6952A340' // AIDollarAlphaUSDT Pool
        }
    ],
    sty: [
        {
            token: ADDRESSES.flow.stgUSDC, // USDC
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42' // AIDollarAlphaUSDC Pool
        }
    ],
    bsc: [
        {
            token: ADDRESSES.bsc.USD1, // USD1
            poolToken: '0xd5255Cc08EBAf6D54ac9448822a18d8A3da29A42' // AIDollarAlphaUSD1 Pool
        },
        {
            token: ADDRESSES.bsc.USDT, // USDT
            poolToken: '0xDc45e7027A0489FE6C2E4A0735097d8E6952A340' // AIDollarAlphaUSDT Pool
        }
    ]
};

const totalAssetsABI = "function totalAssets() external view returns (uint256)";

async function tvl(api) {
    const chain = api.chain;

    const poolsForChain = mainnetContracts[chain];

    if (!poolsForChain || poolsForChain.length === 0) {
        console.warn(`No configured contract data for chain: ${chain}. Skipping TVL calculation.`);
        return {};
    }

    const calls = poolsForChain.map(poolInfo => ({
        target: poolInfo.poolToken,
    }));

    const totalAssetsAmounts = await api.multiCall({
        abi: totalAssetsABI,
        calls: calls,
    });

    totalAssetsAmounts.forEach((amount, index) => {
        const underlyingToken = poolsForChain[index].token;
        api.add(underlyingToken, amount);
    });

    return api.getBalances();
}

module.exports = {
    methodology: 'Counts the total underlying assets (e.g., USDC, USDT, USR, CUSDO, USD1) reported by GAIB protocol pool contracts using their `totalAssets()` function across supported mainnet chains.',
    start: 1715490671,
    timetravel: true,
    misrepresentedTokens: false,

    ethereum: {
        tvl,
    },
    arbitrum: {
        tvl,
    },
    base: {
        tvl,
    },
    sei: {
        tvl,
    },
    sty: {
        tvl,
    },
    bsc: {
        tvl,
    },
};