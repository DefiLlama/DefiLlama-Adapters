// Import the helper functions from DefiLlama's http module
const { getTrxBalance } = require('../http'); // Adjust the path as necessary based on the repo structure

// Treasury wallet address to monitor
const treasuryWallet = 'TFvHNqDqttkXSS8ZTdC4c4W7q97SFW3iKq';

// TVL function to get total TRX in the treasury wallet
async function tvl() {
    try {
        // Get the TRX balance in the treasury wallet
        const trxBalance = await getTrxBalance(treasuryWallet);

        // Return the balance in a format DefiLlama expects
        return { tron: trxBalance / 1_000_000 }; // Convert from sun to TRX
    } catch (error) {
        console.error('Error fetching TRX balance:', error);
        return { tron: 0 };
    }
}

// Export the adapter for DefiLlama
module.exports = {
    tron: {
        tvl,
    },
};
