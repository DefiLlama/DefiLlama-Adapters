const {get} = require("../helper/http");

const HAI_base = '0x73e2a6320314883ff8cc08b53f1460a5f4c47f2c';

const getPools = async (chainId) => {
    const response = await get('https://api.atomica.org/srm-production-v2/v2/pool/list');
    return response.reduce((acc, pool) => {
        if (pool.chainId === chainId && pool.capitalToken?.address.toLowerCase() === HAI_base.toLowerCase()) {
            acc.push(pool.id)
        }
        return acc
    }, [])
}

const getTvl = async (api) => {
    const pools = await getPools(api.chainId);
    const token_owners = pools.map(address => [HAI_base, address]);
    return api.sumTokens({tokensAndOwners: token_owners})
}

module.exports = {
    base: {
        tvl: getTvl,
    },
    methodology: 'We count the HAI staked in the Flash Pools contracts'
}
