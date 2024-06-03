const DETH_DEPOSIT_POOL = "0x8a1229eDB53f55Bb09D472aFc95D12154590108E";
const DUSD_DEPOSIT_POOL = "0x634598473B91a6870c1DB151142db0b61C5de8CC";

async function tvl(api) {
    // Fetch total deposits from DETH_DEPOSIT_POOL
    const ethDeposits = await api.call({
        abi: 'function getTotalDeposits() external view returns (address[], uint256[])',
        target: DETH_DEPOSIT_POOL
    });

    // Fetch total deposits from DUSD_DEPOSIT_POOL
    const usdDeposits = await api.call({
        abi: 'function getTotalDeposits() external view returns (address[], uint256[])',
        target: DUSD_DEPOSIT_POOL
    });

    // Combine token addresses and balances
    const tokens = [...ethDeposits[0], ...usdDeposits[0]];
    const balances = [...ethDeposits[1], ...usdDeposits[1]];

    // Add tokens and their balances to the API
    api.addTokens(tokens, balances);
    return api.getBalances()
}

module.exports = {
    doublecounted: true,
    methodology:
        "Deposited assets (LSTs, LRTs, stables, Pendle tokens, Karak tokens, etc.) in deposit pools",
    ethereum: {
        tvl,
    },
};