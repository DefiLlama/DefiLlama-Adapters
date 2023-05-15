const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");

const MASTER_VIEW_CONTRACT = {
    v146: {
        address: '0x47ecFB57deD0160d66103A6A201C5f30f7CC7d13',
        abi: {
            calculateAssetTVL: 'function calculateRawAssetTVL(uint256 chainId, address pToken) view returns (uint256)'
        }
    }
};

const MOONBEAM_MARKETS = {
    GLMR: {
        pTokenMarketAddress: '0xdC427cDB81E1532747BEDeB8077a4AEcDbfB585e',
        pTokenUnderlyingAddress: '0x0000000000000000000000000000000000000000',
        decimals: 18
    },
    whUSDC: {
        pTokenMarketAddress: '0x227EEB717a3Ec78025bE51c87b3A7160192613D2',
        pTokenUnderlyingAddress: '0x931715FEE2d06333043d11F658C8CE934aC61D0c',
        decimals: 6
    },
    xcUSDT: {
        pTokenMarketAddress: '0x8ef25FAC30DeD9A210151C1d27e58F71f2142e2f',
        pTokenUnderlyingAddress: '0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d',
        decimals: 6
    },
    xcDOT: {
        pTokenMarketAddress: '0x525c6B3D27B6b1Fc28bca7dc04964247c1a942B1',
        pTokenUnderlyingAddress: '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080',
        decimals: 10
    }
};

const AVALANCHE_MARKETS = {
    ETH: {
        pTokenMarketAddress: '0x4Ebba16380fEb2083938c008aEDD4b5EBeA80f72',
        pTokenUnderlyingAddress: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
        decimals: 18
    },
    USDC: {
        pTokenMarketAddress: '0x73c5c93E78cB8CA4939307e0D95e032631fB9eEe',
        pTokenUnderlyingAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
        decimals: 6
    },
    USDT: {
        pTokenMarketAddress: '0x1BF6752282039ee82C06DE64D094C9E35578A1a0',
        pTokenUnderlyingAddress: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
        decimals: 6
    },
};

const ARBITRUM_MARKETS = {
    ETH: {
        pTokenMarketAddress: '0xc01683398fFCc86264ba17bC36977f51A1d25e06',
        pTokenUnderlyingAddress: '0x0000000000000000000000000000000000000000',
        decimals: 18
    },
    USDC: {
        pTokenMarketAddress: '0xddC6Df52F9749ED80966Fb6a9D4C87264cC1e6C1',
        pTokenUnderlyingAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        decimals: 6
    },
};

const ETHEREUM_MARKETS = {
    ETH: {
        pTokenMarketAddress: '0xd833F882ca07F69C4C5a069675B6B65C235325C3',
        pTokenUnderlyingAddress: '0x0000000000000000000000000000000000000000',
        decimals: 18
    },
    USDC: {
        pTokenMarketAddress: '0x67CeC45eB8d9f059D4c974a4BdEA357b68Ad80Ef',
        pTokenUnderlyingAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6
    },
    USDT: {
        pTokenMarketAddress: '0xDC313B592949E8F4bB91A22c6DC9f7BE11b74Ea7',
        pTokenUnderlyingAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6
    },
};

const PRIME_MARKETS = {
    moonbeam: {
        chainId: 1284,
        networkMarkets: MOONBEAM_MARKETS
    },
    avax: {
        chainId: 43114,
        networkMarkets: AVALANCHE_MARKETS
    },
    arbitrum: {
        chainId: 42161,
        networkMarkets: ARBITRUM_MARKETS
    },
    ethereum: {
        chainId: 1,
        networkMarkets: ETHEREUM_MARKETS
    },
}

async function tvl(_, _1, _2, { api }) {
    const moonbeamApi = new sdk.ChainApi({ chain: 'moonbeam'});

    const balances = {};

    const primeMarket = PRIME_MARKETS[api.chain];

    for (const [marketSymbol, market] of Object.entries(primeMarket.networkMarkets)) {
        const rawAssetTVL = await moonbeamApi.call({
            abi: MASTER_VIEW_CONTRACT.v146.abi.calculateAssetTVL,
            target: MASTER_VIEW_CONTRACT.v146.address,
            params: [
                primeMarket.chainId,
                market.pTokenMarketAddress
            ]
        });

        const assetTVL = BigNumber(rawAssetTVL).times(BigNumber(10).pow(market.decimals)).div(BigNumber(10).pow(18)).toNumber();

        balances[`${api.chain}:${market.pTokenUnderlyingAddress}`] = assetTVL;
    }

    return balances;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Adds the deposits of each market to the borrows that were not redeposited into that market.',
    moonbeam: {
        tvl
    },
    avax: {
        tvl
    },
    arbitrum: {
        tvl
    },
    ethereum: {
        tvl
    }
};
