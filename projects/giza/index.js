const arma = require('./arma');
const { getConfig } = require('../helper/cache');

// Arbitrum Pendle PT token addresses (all ETH PT tokens)
const ARBITRUM_PT_TOKENS = [
    "0xab7f3837e6e721abbc826927b655180af6a04388", // PT weETH
    "0x3362c1265a0522f321253708c9fb176f2274fa8d", // PT rETH
    "0x71fbf40651e9d4278a74586afc99f307f369ce9a", // PT wstETH
    "0xc9bfc3afd592cc5a3305aec09aaaa6b9bb4c12d0", // PT rsETH
    "0xd8d5fbbaad1e80aa0352b2029a594caeff6cf1ec", // PT uniETH
];

async function arbitrumTvl(api) {
    // For Arbitrum chain - fetch smart accounts from Pulse API
    const owners = await getConfig('giza/pulse/' + api.chain, 'https://api.usepulse.xyz/api/v1/42161/smart-accounts');

    api.log(`[Pulse] Found ${owners.length} smart accounts on Arbitrum`);

    // Build tokensAndOwners array for each PT token-owner combination
    const tokensAndOwners = [];
    ARBITRUM_PT_TOKENS.forEach(token => {
        owners.forEach(owner => {
            tokensAndOwners.push([token, owner]);
        });
    });

    return api.sumTokens({
        tokensAndOwners,
        permitFailure: true
    });
}
const pulse = {
    arbitrum: { tvl: arbitrumTvl }
};

// Combine Arbitrum TVL from both products
async function combinedArbitrumTvl(api) {
    await arma.arbitrum.tvl(api);
    await pulse.arbitrum.tvl(api);
    return api.getBalances();
}

module.exports = {
    methodology: 'TVL is calculated by querying onchain balances of Giza smart wallet accounts across DeFi lending protocols for the Arma product, and Pendle PT token holdings for the Pulse product.',
    base: arma.base,
    plasma: arma.plasma,
    hyperliquid: arma.hyperliquid,
    arbitrum: { tvl: combinedArbitrumTvl },
}
