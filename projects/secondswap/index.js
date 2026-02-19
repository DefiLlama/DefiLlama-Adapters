const { getConfig } = require('../helper/cache');
const { getAssociatedTokenAddress, getTokenAccountBalances } = require('../helper/solana');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getCoreAssets } = require('../helper/tokenMapping');
const { getUniqueAddresses } = require('../helper/utils');

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

function filterVaults(vaults, coreAssets, chain) {
    const coreSet = new Set(getUniqueAddresses(coreAssets, chain));
    const tvlVaults = [];
    const vestingVaults = [];
    for (const vault of vaults) {
        const addr = chain === 'solana' ? vault.token_address : vault.token_address.toLowerCase();
        if (coreSet.has(addr)) tvlVaults.push(vault);
        else vestingVaults.push(vault);
    }
    return { tvlVaults, vestingVaults };
}

async function sumVaults(api, vaults) {
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

async function tvl(api) {
    const secondswapChain = LLAMA_TO_SECONDSWAP_CHAINS[api.chain];
    if (!secondswapChain) return;
    const vaults = await fetchVestingVaults(secondswapChain);
    const { tvlVaults } = filterVaults(vaults, getCoreAssets(api.chain), api.chain);
    return sumVaults(api, tvlVaults);
}

async function vesting(api) {
    const secondswapChain = LLAMA_TO_SECONDSWAP_CHAINS[api.chain];
    if (!secondswapChain) return;
    const vaults = await fetchVestingVaults(secondswapChain);
    const { vestingVaults } = filterVaults(vaults, getCoreAssets(api.chain), api.chain);
    return sumVaults(api, vestingVaults);
}

module.exports = {
    timetravel: false,
    methodology: "TVL counts whitelisted tokens (stablecoins, native gas tokens) locked in vesting contracts. Vesting counts all other non-circulating tokens.",
    ethereum: { tvl, vesting },
    avax: { tvl, vesting },
    solana: { tvl, vesting },
};