const { getChainTransform } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const contracts = require("./contracts.json");

function coreTvl(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const balances = {};
        const holders = Object.values(contracts[chain].contracts);
        const tokens = (Object.values(contracts[chain].tokens))
            .filter(t => t != contracts[chain].tokens.BORING)
            .map(t => [t, false]);
        const transform = await getChainTransform(chain);

        await sumTokensAndLPsSharedOwners(
            balances,
            tokens,
            holders,
            chainBlocks[chain],
            chain,
            transform
        );

        if (chain == 'kcc' && balances[contracts.ethereum.tokens.USDT]) {
            balances[contracts.ethereum.tokens.USDT] /= 10 ** 12;
        };
        return balances;
    };
};

function staking(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const balances = {};
        if (!contracts[chain].tokens.BORING) {
            return balances;
        };
        const holders = Object.values(contracts[chain].contracts);
        const tokens = [[contracts[chain].tokens.BORING, false]];

        await sumTokensAndLPsSharedOwners(
            balances,
            tokens,
            holders,
            chainBlocks[chain],
            chain,
            a => contracts.ethereum.tokens.BORING
        );

        return balances;
    };
};
function chainTvl(chain) {
    return {
        tvl: coreTvl(chain),
        staking: staking(chain)
    };
};

const chainTVLObject = Object.keys(contracts)
    .reduce((agg, chain) => ({ ...agg, [chain]: chainTvl(chain) }), {});

module.exports = {
    ...chainTVLObject,
}; // node test.js projects/boringdao/index.js