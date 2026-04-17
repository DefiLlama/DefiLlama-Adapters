const { getConfig } = require('../helper/cache');
const axios = require('axios');

const SUPPORTED_TOKENS_URL = 'https://app.sail.money/api/v1/projects/68b43fb4ced0704efcb3143c/pages/69d7b31663e3b54646702cb7/custom/supported_tokens';
const ACTIVE_WALLETS_URL = 'https://app.sail.money/api/v1/projects/sail/pages/institutions/custom/get_all_wallets';

const CHAIN_IDS = {
    ethereum: 1,
    base: 8453,
    arbitrum: 42161,
};

async function getTokens(chainName) {
    const chainId = CHAIN_IDS[chainName];
    const data = await getConfig(`sail/supported-tokens-${chainName}`, undefined, {
        fetcher: async () => {
            const { data } = await axios.post(
                SUPPORTED_TOKENS_URL,
                { params: { chain: chainId } },
                { headers: { Authorization: `Bearer ${process.env.SAIL_API_TOKEN}` } }
            );
            return Array.isArray(data) ? data : data.result;
        },
    });
    return Array.isArray(data) ? data : data.result;
}

async function getOwners() {
    const data = await getConfig('sail/active-wallets', ACTIVE_WALLETS_URL);
    const owners = Array.isArray(data) ? data : data.result;
    return owners.filter(o => o !== '');
}

async function tvl(api) {
    const [owners, tokens] = await Promise.all([
        getOwners(),
        getTokens(api.chain),
    ]);
    await api.sumTokens({ tokens, owners });
}

module.exports = {
    methodology: 'TVL is calculated by querying onchain balances of Sail smart wallet accounts across DeFi protocols/vaults on each supported chain.',
    ethereum: { tvl },
    base: { tvl },
    arbitrum: { tvl },
};
