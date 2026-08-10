const WISE = "0x66a0f676479Cee1d7373f3DC2e2952778BfF5bd6";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// Scrapable transferable WiseStakingNFT (WiseOne)
const WISE_NFT_SCRAPABLE = "0x48791dbdfb38baa58e48329148c321bf33b3c1e1";
// WISE/WETH Uniswap V2 pair — LP tokens are burned (ownerless pool inventory)
const WISE_WETH_PAIR = "0x21b8065d10f73ee2e260e5b47d3344d3ced7596e";

const globalsAbi =
    "function globals() view returns (uint256 totalStaked, uint256 totalShares, uint256 shareRate, uint256 currentWiseDay, uint256 referralShares, uint256 liquidityShares)";
const stakeCountAbi = "function stakeCount(address) view returns (uint256)";
const stakesPaginationAbi =
    "function stakesPagination(address,uint256,uint256) view returns (bytes16[])";
const checkStakeByIDAbi =
    "function checkStakeByID(address,bytes16) view returns (uint256 startDay, uint256 lockDays, uint256 finalDay, uint256 closeDay, uint256 scrapeDay, uint256 stakedAmount, uint256 stakesShares, uint256 rewardAmount, uint256 penaltyAmount, bool isActive, bool isMature)";

// Cache per block so tvl + staking do not double-fetch the same multicalls.
const scrapablePrincipalByBlock = new Map();

/**
 * Locked WISE principal in active WiseOne scrapable staking NFTs.
 * Stakes are owned on the WISE token by the NFT contract; principal is burned
 * into share accounting (not an ERC-20 balance on the NFT).
 * Does not include unclaimed accrued interest.
 */
async function getScrapableNftPrincipal(api) {
    const cacheKey = String(api.block ?? api.timestamp ?? "latest");
    if (scrapablePrincipalByBlock.has(cacheKey)) {
        return scrapablePrincipalByBlock.get(cacheKey);
    }

    const count = await api.call({
        target: WISE,
        abi: stakeCountAbi,
        params: [WISE_NFT_SCRAPABLE],
    });
    if (!count || count === "0" || count === 0) {
        scrapablePrincipalByBlock.set(cacheKey, 0n);
        return 0n;
    }

    const ids = await api.call({
        target: WISE,
        abi: stakesPaginationAbi,
        params: [WISE_NFT_SCRAPABLE, 0, count],
    });
    if (!ids || ids.length === 0) {
        scrapablePrincipalByBlock.set(cacheKey, 0n);
        return 0n;
    }

    const stakes = await api.multiCall({
        abi: checkStakeByIDAbi,
        calls: ids.map((id) => ({
            target: WISE,
            params: [WISE_NFT_SCRAPABLE, id],
        })),
    });

    let sum = 0n;
    for (const stake of stakes) {
        if (!stake) continue;
        const stakedAmount = BigInt(stake.stakedAmount ?? stake[5] ?? 0);
        const isActive = stake.isActive ?? stake[9];
        if (isActive) sum += stakedAmount;
    }
    scrapablePrincipalByBlock.set(cacheKey, sum);
    return sum;
}

/** WiseOne product TVL: active principal in scrapable transferable staking NFTs. */
async function tvl(api) {
    const scrapablePrincipal = await getScrapableNftPrincipal(api);
    api.add(WISE, scrapablePrincipal);
}

/**
 * Other locked WISE principal = protocol globals().totalStaked minus WiseOne
 * scrapable NFT principal (already counted in tvl), so buckets do not overlap.
 * Includes immutable stakes and non-scrapable NFT-wrapped stakes.
 * Does not include unclaimed accrued interest.
 */
async function staking(api) {
    const globals = await api.call({
        target: WISE,
        abi: globalsAbi,
    });
    const totalStaked = BigInt(
        Array.isArray(globals) ? globals[0] : globals.totalStaked ?? globals,
    );
    const scrapablePrincipal = await getScrapableNftPrincipal(api);
    const otherStaked =
        totalStaked > scrapablePrincipal ? totalStaked - scrapablePrincipal : 0n;
    api.add(WISE, otherStaked);
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
        "TVL is locked WISE principal in WiseOne scrapable transferable staking NFTs (0x48791dbdfb38baa58e48329148c321bf33b3c1e1), including long-dated locks up to 15330 days (~42 years). Staking is other locked WISE principal from globals().totalStaked minus that NFT principal (immutable stakes and non-scrapable NFT wrappers). Neither TVL nor staking includes unclaimed accrued interest (scraping realizes interest by minting WISE; it is not part of totalStaked). Pool2 is WISE + WETH reserves in the burned-LP Uniswap V2 WISE/WETH pair.",
    ethereum: {
        tvl,
        staking,
        pool2,
    },
};
