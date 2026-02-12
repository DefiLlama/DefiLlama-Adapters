const { getConfig } = require('../helper/cache');
const { getAssociatedTokenAddress, getTokenAccountBalances } = require('../helper/solana');
const { sumTokens2 } = require('../helper/unwrapLPs');

const BASE_API_URL = "https://secondswap-data-proxy.vercel.app";
const VAULTS_API = `${BASE_API_URL}/vesting-vaults`;

const LLAMA_TO_SECONDSWAP_CHAINS = {
    ethereum: 'ethereum',
    avax: 'avalanche_c_chain',
    solana: 'solana',
};

async function fetchVestingVaults(secondswapChain) {
    const data = await getConfig(
        `secondswap/vaults/${secondswapChain}`,
        `${VAULTS_API}?chain=${secondswapChain}`,
    );
    const vaults = data?.vaults ?? data;
    return Array.isArray(vaults) ? vaults : [];
}

async function tvl(api) {
    const secondswapChain = LLAMA_TO_SECONDSWAP_CHAINS[api.chain];
    if (!secondswapChain) throw new Error(`Unsupported network: ${api.chain}`);

    const vaults = await fetchVestingVaults(secondswapChain);
    if (vaults.length === 0) return;

    if (api.chain === 'solana') {
        const ataAddresses = vaults.map((vault) =>
            getAssociatedTokenAddress(vault.token_address, vault.vesting_address)
        );
        const tokenMints = vaults.map((vault) => vault.token_address);
        const tokenAccountBalances = await getTokenAccountBalances(ataAddresses, {
            individual: true,
            chain: api.chain,
        });
        tokenAccountBalances.forEach((item, i) => {
            const balance = item.amount ?? item.balance ?? '0';
            api.add(tokenMints[i], balance);
        });
    } else {
        const tokensAndOwners = vaults.map((vault) => [vault.token_address, vault.vesting_address]);
        return sumTokens2({ api, tokensAndOwners });
    }
}

module.exports = {
    timetravel: false,
    methodology: "SecondSwap is a decentralized marketplace for trading and managing locked/vesting tokens. TVL represents the total value of tokens currently locked in vesting contracts across all chains",
    ethereum: { tvl: () => ({}), vesting: tvl },
    avax: { tvl: () => ({}), vesting: tvl },
    solana: { tvl: () => ({}), vesting: tvl },
};