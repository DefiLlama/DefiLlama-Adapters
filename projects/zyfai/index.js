const { beetsTvl, penpieTvl, sonicTokens } = require('./helpers');
const { allPoolTokens: baseTokens } = require('./base');
const { getConfig } = require('../helper/cache');
const { allPoolTokens: arbitrumPoolTokens } = require('./arbitrum');
const { allPoolTokens: plasmaPoolTokens } = require('./plasma');
const { allPoolTokens: ethereumPoolTokens } = require('./ethereum');

const TOKENS = {
  base: baseTokens,
  arbitrum: arbitrumPoolTokens,
  plasma: plasmaPoolTokens,
  ethereum: ethereumPoolTokens,
  sonic: sonicTokens,
};

async function tvl(api) {
    const owners = await getConfig('zyfai/'+api.chain, `https://api.zyf.ai/api/v1/data/active-wallets?chainId=${api.chainId}`);
    const cleanOwners = owners.filter(o => o !== '');

    if(api.chain == 'sonic') {
        await Promise.all([
            beetsTvl(api, cleanOwners),
            penpieTvl(api, cleanOwners),
        ]);
    }

    return api.sumTokens({ownerTokens: cleanOwners.map(o => [TOKENS[api.chain], o])});
}

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol across multiple DeFi protocols',
    sonic: { tvl },
    base: { tvl },
    arbitrum: { tvl },
    plasma: { tvl },
    ethereum: { tvl },
}