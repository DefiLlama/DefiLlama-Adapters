const { sumTokensAndLPsSharedOwners, unwrapCrv } = require('../helper/unwrapLPs');
const { getChainTransform } = require('../helper/portedTokens');
const contracts = require('./contracts');
const chains = Object.keys(contracts);

function getTokens(chain, type) {
    switch (type) {
        case 'tvl':
            const tokens = Object.values(contracts[chain].tokens.base)
                .map(t => [t, false]);
            const lps = Object.values(contracts[chain].tokens.lp)
                .map(t => [t, true]);
            return tokens.concat(lps);
        case 'staking':
            return Object.values(contracts[chain].tokens.staking)
                .map(t => [t, false]);
        case 'pool2':
            const pool2s = Object.entries(contracts[chain].tokens.pool2);
            const univ2Lps = pool2s.filter(p => !p[0].includes('CURVE'))
                .map(p => [p[1], true]);
            const curveLps = pool2s.filter(p => p[0].includes('CURVE'))
                .map(p => [p[1], false]);
            return univ2Lps.concat(curveLps);
    };
};

async function unwrapCrvGauge(balances, tokens, chainBlocks, chain, transform) {
    const crvLps = tokens.filter(t => t[1] == false);
    if (crvLps.length == 0) return;

    for (let i = 0; i < crvLps.length; i++) {
        await unwrapCrv(
            balances,
            crvLps[i][0],
            balances[`${chain}:${crvLps[i][0]}`],
            chainBlocks[chain],
            chain,
            transform
        );
        delete balances[`${chain}:${crvLps[i][0]}`];
    };
    for (key in contracts[chain].curveGaugeMapping) {
        if (`${chain}:${key}` in balances) {
            await unwrapCrv(
                balances,
                contracts[chain].curveGaugeMapping[key],
                balances[`${chain}:${key}`],
                chainBlocks[chain],
                chain,
                transform
            );
            delete balances[`${chain}:${key}`];
        };
    };
};

const tvl = (chain, type) => {
    return async (_t, _e, chainBlocks) => {
        let balances = {};
        const transform = await getChainTransform(chain);

        let holders = []
        for (key in contracts[chain].tokenHolders) {
            holders.push(...Object.values(contracts[chain].tokenHolders[key]));
        };

        const tokens = getTokens(chain, type);
        await sumTokensAndLPsSharedOwners(
            balances,
            tokens,
            holders,
            chainBlocks[chain],
            chain,
            transform
        );

        await unwrapCrvGauge(
            balances,
            tokens,
            chainBlocks,
            chain,
            transform
        );

        return balances;
    };
};

const chainTypeExports = (chains) => {
    return chains.reduce((obj, chain) => ({
        ...obj,
        [chain]: {
            tvl: tvl(chain, "tvl"),
            pool2: tvl(chain, "pool2"),
            staking: tvl(chain, "staking")
        }
    }), {}
    );
};

module.exports = chainTypeExports(chains);