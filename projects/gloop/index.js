const LENDING_POOL_ADDRESS = "0x9BE2e5739B1a6A175d36Ce043f44E66965a433EB";
const GMI_TOKEN_ADDRESS = "0xAad4187a81689AF72d91966c8119756E425cD7CF";

// Token addresses on Arbitrum
const GM_BTC_ADDRESS = "0x47c031236e19d024b42f8AE6780E44A573170703";
const GM_ETH_ADDRESS = "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336";
const GM_SOL_ADDRESS = "0x09400D9DB990D5ed3f35D7be61DfAEB900Af03C9";
const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

async function tvl(api) {
    // Get GM Lending TVL by calling totalUnderlying for each supported token
    const supportedTokens = [
        GM_BTC_ADDRESS,
        GM_ETH_ADDRESS,
        GM_SOL_ADDRESS,
        USDC_ADDRESS,
    ];

    const underlyingBalances = await api.multiCall({
        abi: "function totalUnderlying(address) view returns (uint256)",
        calls: supportedTokens.map((token) => ({
            target: LENDING_POOL_ADDRESS,
            params: [token],
        })),
    });

    // Add underlying token balances from lending pools
    supportedTokens.forEach((token, i) => {
        api.add(token, underlyingBalances[i]);
    });

    // Get GMI TVL by calling totalControlledValue(true)
    const gmiTvl = await api.call({
        abi: "function totalControlledValue(bool) view returns (uint256)",
        target: GMI_TOKEN_ADDRESS,
        params: [true],
    });

    // Convert GMI TVL from 18 decimals (USD in wei) to 6 decimals (USDC format)
    const gmiTvlConverted = gmiTvl / 1e12;

    // Add GMI TVL as USDC equivalent
    api.add(USDC_ADDRESS, gmiTvlConverted);
}

async function borrowed(api) {
    // Get total borrowed by calling totalBorrows with USDC address
    const totalBorrowed = await api.call({
        abi: "function totalBorrows(address) view returns (uint256)",
        target: LENDING_POOL_ADDRESS,
        params: [USDC_ADDRESS],
    });

    // Add borrowed amount as USDC
    api.add(USDC_ADDRESS, totalBorrowed);
}

module.exports = {
    methodology:
        "Gloop TVL consists of two parts: (1) GMI Index TVL from totalControlledValue(true) which tracks the total USD value of GM tokens in the index, and (2) GM Lending TVL from totalUnderlying() for each supported token (GM BTC, GM ETH, GM SOL, USDC) in the lending pools.",
    // A little after Lending Pool contract was deployed
    start: 1744340400,
    arbitrum: {
        tvl,
        borrowed,
    },
};

