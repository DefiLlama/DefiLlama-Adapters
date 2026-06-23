const CHAIN = 'bsc';

// ==============================================================================
// CONFIGURATION
// ==============================================================================

const CONTRACTS = {
    ART_TOKEN: '0xb8a1eD561C914F22BD69b0bb4558ad5A89FeAAE1', // Address of ARTToken.sol
};

// ==============================================================================
// ABIs
// ==============================================================================

const ABIs = {
    totalSupply: "function totalSupply() view returns (uint256)",
};

// ==============================================================================
// TVL CALCULATION
// ==============================================================================

async function tvl(api) {
    // 1. Get Total Supply of ART Token
    const totalSupply = await api.call({
        target: CONTRACTS.ART_TOKEN,
        abi: ABIs.totalSupply,
    });

    // 2. Add the token balance to the API
    // By adding the token address and its amount (totalSupply),
    // DefiLlama's SDK will automatically fetch the price from PancakeSwap (or other DEXs)
    // and convert it to USD.
    api.add(CONTRACTS.ART_TOKEN, totalSupply);
}

// ==============================================================================
// EXPORT
// ==============================================================================

module.exports = {
    methodology: "TVL is calculated by fetching the total supply of the ART token. The price is automatically determined by DefiLlama using on-chain DEX liquidity (e.g., PancakeSwap).",
    [CHAIN]: {
        tvl,
    },
};