const USDS_CONTRACT_ADDRESS = '0xdC035D45d973E3EC169d2276DDab16f1e407384F';
const ESPN_CONTRACT_ADDRESS = '0xb250C9E0F7bE4cfF13F94374C993aC445A1385fE';

const ESPN_ABI = {
    totalAssets: "function totalAssets() view returns (uint256)",
};

async function tvl(api) {
    const espnTotalAssets = await api.call({
        abi: ESPN_ABI.totalAssets,
        target: ESPN_CONTRACT_ADDRESS,
    });
    api.add(USDS_CONTRACT_ADDRESS, espnTotalAssets);
    return api.getBalances();
}

module.exports = {
    methodology: 'Calculates total USDS TVL from ESPN contract totalAssets() only.',
    ethereum: {
        tvl,
    },
};
