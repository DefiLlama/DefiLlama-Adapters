const { fetchURL } = require('../helper/utils');

// Indexer provider
const NAMADA_INDEXER = 'https://indexer.namada.tududes.com';

async function tvl(api) {
    // Get all tokens on Namada by querying the IBC rate limits endpoint
    let rate_limits = await fetchURL(`${NAMADA_INDEXER}/api/v1/ibc/rate-limits`);

    // Get total supply of each non-nativetoken
    for (const [idx, data] of Object.entries(rate_limits.data)) {
        if (data.tokenAddress == 'tnam1q9gr66cvu4hrzm0sd5kmlnjje82gs3xlfg3v6nu7') {
            continue;
        }
        const response = await fetchURL(`${NAMADA_INDEXER}/api/v1/chain/token-supply?address=${data.tokenAddress}`);

        if (response.data && response.data.totalSupply) {
            const totalSupply = response.data.totalSupply;

            api.add(data.tokenAddress, totalSupply);
        }

    }
}

module.exports = {
    methodology: 'Calculates TVL by querying an indexer for the total supply of each whitelisted token within Namada',
    timetravel: false,
    hallmarks: [
        ['2025-02-24', 'Namada Phase 3 (IBC + MASP) launched'],
    ],
    namada: {
        tvl,
    }
};