const sdk = require("@defillama/sdk");
const { transformBscAddress } = require('../helper/portedTokens');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');
const abis = require("./abis.json");

const DDDX = '0x4B6ee8188d6Df169E1071a7c96929640D61f144f';
const excludedTokens = [
    '0x15330196e88a09637bd2a8d206c7c85fe99594d0',
    '0x4b6ee8188d6df169e1071a7c96929640d61f144f',
];

async function staking(timestamp, block, chainBlocks) {
    return {
        [`bsc:${DDDX}`]: (await sdk.api.abi.call({
            target: '0xFe9e21e78089094E1443169c4c74bBBBcBb13DE0', //ve
            abi: abis.locked,
            params: [8],
            block: chainBlocks.bsc,
            chain: 'bsc'
        })).output.amount
    };
}

function tvl(pool2 = false) {
    return async (timestamp, block, chainBlocks) => {
        const balances = {};
        const transform = await transformBscAddress();

        const noPairs = (await sdk.api.abi.call({
            target: '0xb5737A06c330c22056C77a4205D16fFD1436c81b', // BaseV1Factory
            abi: abis.allPairsLength,
            block: chainBlocks.bsc,
            chain: 'bsc'
        })).output;

        const pairAddresses = (await sdk.api.abi.multiCall({
            target: '0xb5737A06c330c22056C77a4205D16fFD1436c81b',  // BaseV1Factory
            calls: Array.from({ length: Number(noPairs) }, (_, k) => ({
                params: k,
            })),
            abi: abis.allPairs,
            block: chainBlocks.bsc,
            chain: 'bsc'
        })).output;

        let pairBalances = (await sdk.api.abi.multiCall({
            target: '0x89BEda6E5331CdDEe6c9a5Ad1B789ce6dFEBe6c7', // LpDepositor
            calls: pairAddresses.map(a => ({
                params: a.output
            })),
            abi: abis.totalBalances,
            block: chainBlocks.bsc,
            chain: 'bsc'
        })).output;

        const [token0s, token1s] = await Promise.all([
            sdk.api.abi.multiCall({
                calls: pairAddresses.map(a => ({
                    target: a.output
                })),
                abi: abis.token0,
                block: chainBlocks.bsc,
                chain: "bsc"
            }),
            sdk.api.abi.multiCall({
                calls: pairAddresses.map(a => ({
                    target: a.output
                })),
                abi: abis.token0,
                block: chainBlocks.bsc,
                chain: "bsc"
            })
        ]);

        let lpPositions = [];
        let pool2Positions = [];
        for (let i = 0; i < pairBalances.length; i++) {
            if (
                pairAddresses[i].output &&
                excludedTokens.includes(pairAddresses[i].output.toLowerCase())
            ) {
                continue;
            }
            if (excludedTokens.includes(token0s.output[i].output.toLowerCase()) ||
                excludedTokens.includes(token1s.output[i].output.toLowerCase())) {
                pool2Positions.push({
                    balance: pairBalances[i].output,
                    token: pairAddresses[i].output
                });
            } else {
                lpPositions.push({
                    balance: pairBalances[i].output,
                    token: pairAddresses[i].output
                });
            }
        }

        await unwrapUniswapLPs(
            balances,
            pool2 ? pool2Positions : lpPositions,
            chainBlocks.bsc,
            'bsc',
            transform
        );

        return balances;
    };
}

module.exports = {
    doublecounted: true,
    bsc: {
        tvl: tvl(),
        pool2: tvl(true),
        staking
    }
};
