const { sumTokens2 } = require('../helper/unwrapLPs');

const ETHEREUM_UNISWAP_POOL = '0xbD216513d74C8cf14cf4747E6AaA6420FF64ee9e';
const OPTIMISM_UNISWAP_POOL = '0xC3146DB478c216182aCd42053A5361Fbc0258E10';

module.exports = {
    optimism: {
        tvl: async (_, _b, _cb, { api }) => {
            const token0 = await api.call({ target: OPTIMISM_UNISWAP_POOL, abi: 'address:token0' });
            const token1 = await api.call({ target: OPTIMISM_UNISWAP_POOL, abi: 'address:token1' });
            return sumTokens2({ 
                api, 
                tokens: [token0, token1],  
                owners: [OPTIMISM_UNISWAP_POOL],  
            });
        },
    }
};
