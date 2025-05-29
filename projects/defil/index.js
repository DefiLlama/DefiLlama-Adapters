const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');
const { getChainTransform } = require('../helper/portedTokens');
const { staking } = require("../helper/staking.js");
const { pool2 } = require('../helper/pool2');
const contracts = require('./contracts.json');
const abi = "uint256:totalBorrows"

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
            }
        }

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
}
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
}
module.exports = {
    bsc: {
        tvl: tvl('bsc'),
        staking: staking(
            contracts.bsc.holders.DFL,
            contracts.bsc.tokens.DFL.address,
            'bsc',
        ),
        pool2: pool2(
            contracts.bsc.pool2, 
            contracts.bsc.tokens['DFL-USDT'].address, 
            'bsc'
        ),
    },
    ethereum: {
        tvl: tvl('ethereum'),
        staking: staking(
            contracts.ethereum.holders.DFL,
            contracts.ethereum.tokens.DFL.address
        ),
        pool2: pool2(
            contracts.ethereum.pool2, 
            contracts.ethereum.tokens['DFL-USDT'].address, 
            'ethereum'
        ),
        borrowed: borrowed('ethereum')
    }
};