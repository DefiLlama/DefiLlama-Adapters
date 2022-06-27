const { sumTokens } = require('../helper/unwrapLPs');
const contracts = require('./contracts.json');
const chains = Object.keys(contracts);

function getTokens(chain, type) {
    switch (type) {
        case 'tvl':
            const tokens = Object.values(contracts[chain].tokens.base)
            const lps = Object.values(contracts[chain].tokens.lp)
            return tokens.concat(lps);

        case 'staking':
            return Object.values(contracts[chain].tokens.staking)

        case 'pool2':
            return Object.values(contracts[chain].tokens.pool2)
    };
};

const tvl = (chain, type) => {
    return async (_t, _e, { [chain]: block}) => {
        let holders = []
        for (let key in contracts[chain].tokenHolders) {
            holders.push(...Object.values(contracts[chain].tokenHolders[key]));
        };

        const tokens = getTokens(chain, type)
        const toa = tokens.map(t => holders.map(o => [t, o])).flat()
        return sumTokens({}, toa, block, chain, undefined, { resolveCrv: true, resolveLP: true })
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