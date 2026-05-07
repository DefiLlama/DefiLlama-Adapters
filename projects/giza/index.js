const arma = require('./arma');
const pulse = require('./pulse');

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
