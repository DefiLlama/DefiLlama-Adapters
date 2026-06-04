const { getConfig, configPost } = require('../helper/cache');

const SUPPORTED_TOKENS_URL = 'https://app.sail.money/api/v1/projects/68b43fb4ced0704efcb3143c/pages/69d7b31663e3b54646702cb7/custom/supported_tokens';
const ACTIVE_WALLETS_URL = 'https://app.sail.money/api/v1/projects/sail/pages/institutions/custom/get_all_wallets';

const CHAIN_IDS = {
    ethereum: 1,
    base: 8453,
    arbitrum: 42161,
};

async function getTokens(chainName) {
    const data = await configPost(`sail/supported-tokens-${chainName}`, SUPPORTED_TOKENS_URL, { params: { chain: CHAIN_IDS[chainName] } });
    return Array.isArray(data) ? data : (data?.result ?? []);
}

async function getOwners() {
    const data = await getConfig('sail/active-wallets', ACTIVE_WALLETS_URL);
    const owners = Array.isArray(data) ? data : (data?.result ?? []);
    return owners.filter(o => typeof o === 'string' && /^0x[0-9a-fA-F]{40}$/.test(o));
}

async function tvl(api) {
    const [owners, tokens] = await Promise.all([
        getOwners(),
        getTokens(api.chain),
    ]);
    await api.sumTokens({ tokens, owners, permitFailure: true });
}

module.exports = {
    methodology: 'TVL is the sum of supported-token balances held by Sail smart-wallet accounts on each supported chain, priced via DefiLlama.',
    hallmarks: [['2026-04-27', 'Security Incident']], // https://x.com/SaildotMoney/status/2049574222784004180
    isHeavyProtocol: true,
    ethereum: { tvl },
    base: { tvl },
    arbitrum: { tvl },
};
