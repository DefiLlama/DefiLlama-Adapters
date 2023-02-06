const sdk = require("@defillama/sdk");
const { getChainTransform } = require("../helper/portedTokens");
const { sumTokensSharedOwners } = require("../helper/unwrapLPs");
const contracts = require('./contracts');

function staking(chain) {
    return async (timestamp, block, chainBlocks) => {
        return {
            [contracts.NEST.ethereum]:
            (await sdk.api.abi.multiCall({
                target: contracts.NEST[chain],
                calls: contracts.stakingContracts[chain].map(h => ({
                    params: h
                })),
                block: chainBlocks[chain],
                abi: 'erc20:balanceOf',
                chain
            })).output.map(b => b.output)
                .reduce((a, b) => Number(a) + Number(b), 0)
        };
    };
}

function tvl(chain) {
    return async (timestamp, block, chainBlocks) => {
        const balances = {};
        const transform = await getChainTransform(chain);

        if (!contracts.tvlContracts.hasOwnProperty([chain])) {
            return balances;
        }

        await sumTokensSharedOwners(
            balances,
            contracts.tokens[chain],
            contracts.tvlContracts[chain],
            chainBlocks[chain],
            chain,
            transform
        );

        return balances;
    };
}

const chainExports = Object.keys(contracts.stakingContracts).reduce((a, chain) => ({
    ...a, [chain]: {
        tvl: tvl(chain),
        staking: staking(chain)
    }
}), {})

module.exports = {
    methodology: "Counts NEST tokens that have been staked in the nest dapp",
    ...chainExports
};