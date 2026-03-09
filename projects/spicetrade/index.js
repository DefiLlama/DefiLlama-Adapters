const { sumTokens2 } = require('../helper/unwrapLPs');
// taken from https://docs.spicetrade.ai/misc/official-addresses
const contracts = require('./contracts.json');
const chains = Object.keys(contracts);
const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')

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
    }
}

const tvl = (chain, type) => {
    return async (api) => {
        let holders = []
        for (let key in contracts[chain].tokenHolders) {
            holders.push(...Object.values(contracts[chain].tokenHolders[key]));
        }

        const tokens = getTokens(chain, type)
        const toa = tokens.map(t => holders.map(o => [t, o])).flat()
        return sumTokens2( { api, tokensAndOwners: toa, resolveLP: true })
    };
};

const chainTypeExports = (chains) => {
    return chains.reduce((obj, chain) => {
        const uniTVL = getUniTVL({
            factory: contracts[chain].factory,
            useDefaultCoreAssets: true,
        })
        return ({
            ...obj,
            [chain]: {
                tvl: sdk.util.sumChainTvls([uniTVL, ]),
                pool2: tvl(chain, "pool2"),
                staking: tvl(chain, "staking")
            }
        })
    }, {}
    );
};

module.exports = chainTypeExports(chains)