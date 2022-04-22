const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');
const { getChainTransform } = require('../helper/portedTokens');
const { staking } = require("../helper/staking.js");
const contracts = require('./contracts.json');
const abi = require('./abi.json');

function tvl(chain) {
    return async (timestamp, block, chainBlocks) => {
        const balances = {};
        const transform = await getChainTransform(chain);
        const tokens = Object.values(contracts[chain].tokens);

        const calls = Object.values(contracts[chain].holders).map(
            function (h, i) {
                return {
                    target: tokens[i].address,
                    params: [h]
                }
            }
        );

        const poolBalances = await sdk.api.abi.multiCall({
            abi: 'erc20:balanceOf',
            calls,
            block: chainBlocks[chain],
            chain
        });

        sdk.util.sumMultiBalanceOf(
            balances,
            poolBalances,
            true,
            transform
        );

        const lpPositions = [];
        for (let i = 0; i < poolBalances.output.length; i++) {
            if (tokens[i].isLP) {
                lpPositions.push(
                    {
                        balance: poolBalances.output[i].output,
                        token: tokens[i].address
                    }
                );
            };
        };

        delete balances[contracts.ethereum.tokens.DFL.address];

        await unwrapUniswapLPs(
            balances,
            lpPositions,
            chainBlocks[chain],
            chain,
            transform
        );

        return balances;
    };
};
function borrowed(chain) {
    return async (timestamp, block, chainBlocks) => {
        return { 
            [contracts.ethereum.tokens.eFIL.address]: (
                await sdk.api.abi.call({
                    target: contracts[chain].holders.eFIL,
                    abi,
                    chain,
                    block: chainBlocks[chain]
                })).output 
            };
    };
};
function tvlArbitrum(timestamp, block, chainBlocks) {
    const chain = 'arbitrum';
    const USDT_ADDRESS = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';

    const EFIL_USDT_POOL_ADDRESS = '0xF8E5a77a4f187cFb455663B37619257565439F6A';
    const DFL_USDT_POOL_ADDRESS = '0x27a664dFBcBAe7E7DFec8B489473392fCe2b0C2C';

    // Uniswap V3 eFIL-USDT pool
    let eFilUsdtPoolEFILBalance = (await sdk.api.abi.call({
        target: contracts.arbitrum.tokens.eFIL,
        params: EFIL_USDT_POOL_ADDRESS,
        abi: "erc20:balanceOf",
        chain: chain,
        block: chainBlocks[chain]
    })).output;

    const eFilUsdtPoolUsdtBalance = (await sdk.api.abi.call({
        target: USDT_ADDRESS,
        params: EFIL_USDT_POOL_ADDRESS,
        abi: "erc20:balanceOf",
        chain: chain,
        block: chainBlocks[chain]
    })).output;

    // Uniswap V3 DFL-USDT pool
    const dflUsdtPoolDflBalance = (await sdk.api.abi.call({
        target: contracts.arbitrum.tokens.DFL,
        params: DFL_USDT_POOL_ADDRESS,
        abi: "erc20:balanceOf",
        chain: chain,
        block: chainBlocks[chain]
    })).output;

    const dflUsdtPoolUsdtBalance = (await sdk.api.abi.call({
        target: USDT_ADDRESS,
        params: DFL_USDT_POOL_ADDRESS,
        abi: "erc20:balanceOf",
        chain: chain,
        block: chainBlocks[chain]
    })).output;

    // i dont know how to calculate it
    let dflUsdtPrice = 0;
    let eFilUsdtPrice = 0;

    return (eFilUsdtPoolEFILBalance * eFilUsdtPrice + eFilUsdtPoolUsdtBalance) + (dflUsdtPoolDflBalance * dflUsdtPrice + dflUsdtPoolUsdtBalance)
    
};
module.exports = {
    bsc: {
        tvl: tvl('bsc'),
        staking: staking(
            contracts.bsc.holders.DFL,
            contracts.bsc.tokens.DFL.address,
            'bsc',
            contracts.ethereum.tokens.DFL.address
        ),
        //borrowed: borrowed('bsc')
    },
    ethereum: {
        tvl: tvl('ethereum'),
        staking: staking(
            contracts.ethereum.holders.DFL,
            contracts.ethereum.tokens.DFL.address
        ),
        borrowed: borrowed('ethereum')
    },
    arbitrum: {
        tvl: tvlArbitrum
    }
};