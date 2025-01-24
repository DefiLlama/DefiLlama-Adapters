const sdk = require('@defillama/sdk');
const { getLogs } = require('../helper/cache/getLogs');

const INFINITYPOOLS_FACTORY = "0x86342D7bBe93cB640A6c57d4781f04d93a695f08";
const INFINITYPOOLS_PERIPHERY_VAULT = "0xF8FAD01B2902fF57460552C920233682c7c011a7";

const startBlocks = {
    base: 24888600
};

function chainTvl(chain) {
    return async (api) => {
        const START_BLOCK = startBlocks[chain];
        const logs = (
            await getLogs({
                api,
                target: INFINITYPOOLS_FACTORY,
                fromBlock: START_BLOCK,
                topic: 'PoolCreated(address,address,int256,address,uint8,uint8)',
            })
        );
        const block = api.block;

        const poolAddresses = [];
        const token0Addresses = [];
        const token1Addresses = [];
        const SLICE_INDEX = 2 + 64 + 24;
        for (let log of logs) {
            token0Addresses.push(`0x${log.topics[1].substr(-40)}`.toLowerCase());
            token1Addresses.push(`0x${log.topics[2].substr(-40)}`.toLowerCase());
            poolAddresses.push(`0x${log.data.slice(SLICE_INDEX, SLICE_INDEX + 40)}`.toLowerCase());
        }

        const pools = {};
        // add token0Addresses
        token0Addresses.forEach((token0Address, i) => {
            const poolAddress = poolAddresses[i];
            pools[poolAddress] = {
                token0Address: token0Address,
            };
        });

        // add token1Addresses
        token1Addresses.forEach((token1Address, i) => {
            const poolAddress = poolAddresses[i];
            pools[poolAddress] = {
                ...(pools[poolAddress] || {}),
                token1Address: token1Address,
            };
        });

        let balanceCalls = [];


        for (let pool of Object.keys(pools)) {
            balanceCalls.push({
                target: pools[pool].token0Address,
                params: pool,
            });
            balanceCalls.push({
                target: pools[pool].token1Address,
                params: pool,
            });

            //add balance of vault in the TVL as well. This represent the vault deposits that users want to use as margin
            balanceCalls.push({
                target: pools[pool].token0Address,
                params: INFINITYPOOLS_PERIPHERY_VAULT,
            });
            balanceCalls.push({
                target: pools[pool].token1Address,
                params: INFINITYPOOLS_PERIPHERY_VAULT,
            });
        }

        const tokenBalances = (
            await sdk.api.abi.multiCall({
                abi: 'erc20:balanceOf',
                calls: balanceCalls,
                block,
                chain,
            })
        );
        let transform = id => id;
        if (chain === "base") {
            transform = i => `base:${i}`;
        }

        let balances = {};

        sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform);

        return balances;
    };
}



module.exports = {
    misrepresentedTokens: true,
    base: {
        tvl: chainTvl('base'),
    }
};