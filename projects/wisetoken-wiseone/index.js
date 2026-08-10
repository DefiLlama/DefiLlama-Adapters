const WISE = "0x66a0f676479Cee1d7373f3DC2e2952778BfF5bd6";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// WISE/WETH Uniswap V2 pair — LP tokens are burned (ownerless pool inventory)
const WISE_WETH_PAIR = "0x21b8065d10f73ee2e260e5b47d3344d3ced7596e";

const globalsAbi =
    "function globals() view returns (uint256 totalStaked, uint256 totalShares, uint256 shareRate, uint256 currentWiseDay, uint256 referralShares, uint256 liquidityShares)";

/**
 * WISE staking burns tokens into share accounting on the WISE token contract.
 * Protocol-wide locked principal is exposed via globals().totalStaked.
 * Includes immutable stakes and NFT-wrapped transferable stakes (incl. scrapable
 * WiseStakingNFT at 0x48791dbdfb38baa58e48329148c321bf33b3c1e1).
 */
async function staking(api) {
    const globals = await api.call({
        target: WISE,
        abi: globalsAbi,
    });
    // Multi-return ABIs come back as arrays from the SDK
    const totalStaked = Array.isArray(globals) ? globals[0] : globals;
    api.add(WISE, totalStaked);
}

/**
 * Count WISE + WETH sitting in the canonical Uniswap V2 pair.
 * LP supply is burned, so there is no farm contract to read — measure pair balances.
 */
async function pool2(api) {
    return api.sumTokens({
        owners: [WISE_WETH_PAIR],
        tokens: [WISE, WETH],
    });
}

module.exports = {
    methodology:
        "Staking TVL is WISE locked in the Wise staking system (globals().totalStaked on the WISE token), including long-dated stakes (up to 15330 days / ~42 years), scrapable interest, and transferable WiseStakingNFT positions (WiseOne). Pool2 is WISE + WETH reserves in the burned-LP Uniswap V2 WISE/WETH pair.",
    ethereum: {
        tvl: () => ({}),
        staking,
        pool2,
    },
};
