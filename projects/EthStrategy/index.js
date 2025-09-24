const USDS_CONTRACT_ADDRESS = '0xdC035D45d973E3EC169d2276DDab16f1e407384F';
const ESPN_CONTRACT_ADDRESS = '0xb250C9E0F7bE4cfF13F94374C993aC445A1385fE';
const UNISWAP_V3_POOL = '0x6007905d106ca97f4fe032d818e815657122b01e'; // This is the address that holds USDS for Uniswap V3, previously OWNER_ADDRESS in earlier simplified tests

// ABIs
const ESPN_ABI = {
    totalAssets: "function totalAssets() view returns (uint256)",
    asset: "function asset() view returns (address)"
};

async function tvl(api) {
    // Part 1: Get USDS from ESPN contract
    const underlyingAsset = await api.call({
        abi: ESPN_ABI.asset,
        target: ESPN_CONTRACT_ADDRESS,
    });

    const espnTotalAssets = await api.call({
        abi: ESPN_ABI.totalAssets,
        target: ESPN_CONTRACT_ADDRESS,
    });

    // Part 2: Get USDS from Uniswap V3 Pool (simplified approach from earlier debugging)
    const uniswapUSDSAmount = await api.call({
        abi: 'erc20:balanceOf',
        target: USDS_CONTRACT_ADDRESS,
        params: [UNISWAP_V3_POOL]
    });

    // Add both amounts to TVL
    api.add(USDS_CONTRACT_ADDRESS, espnTotalAssets);
    api.add(USDS_CONTRACT_ADDRESS, uniswapUSDSAmount);

    return api.getBalances();
}

module.exports = {
    methodology: 'Calculates total USDS TVL from ESPN contract totalAssets() and USDS balance in the specified Uniswap V3 pool.',
    ethereum: {
        tvl,
    },
};