const { getChainTransform, getFixBalances } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const contracts = require("./contracts.json");
const sdk = require("@defillama/sdk");

function coreTvl(chain) {
    return async (timestamp, ethBlock, chainBlocks) => {
        const balances = {};
        const holders = Object.values(contracts[chain].contracts);
        const tokens = (Object.values(contracts[chain].tokens))
            .filter(t => t != contracts[chain].tokens.BORING 
                && t != contracts[chain].tokens.BOR)
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
        (await getFixBalances(chain))(balances)

        if (chain == "ethereum") {
            const bridgedAssets = await sdk.api.abi.multiCall({
                calls: Object.values(contracts[chain].oTokens).map((o) => ({target: o})),
                abi: "erc20:totalSupply",
                block: chainBlocks[chain],
              });
            sdk.util.sumMultiBalanceOf(balances, bridgedAssets, true);
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

        if (chain == 'ethereum') {
            tokens.push([contracts[chain].tokens.BOR, false])
        };

        await sumTokensAndLPsSharedOwners(
            balances,
            tokens,
            holders,
            chainBlocks[chain],
            chain,
            a => a == contracts.ethereum.tokens.BOR 
                ? contracts.ethereum.tokens.BOR 
                : contracts.ethereum.tokens.BORING
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
};