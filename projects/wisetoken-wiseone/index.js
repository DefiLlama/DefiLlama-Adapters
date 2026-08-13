const WISE = "0x66a0f676479Cee1d7373f3DC2e2952778BfF5bd6";
// Scrapable transferable WiseStakingNFT (WiseOne)
const WISE_NFT_SCRAPABLE = "0x48791dbdfb38baa58e48329148c321bf33b3c1e1";

const stakeCountAbi = "function stakeCount(address) view returns (uint256)";
const stakesPaginationAbi =
    "function stakesPagination(address,uint256,uint256) view returns (bytes16[])";
const checkStakeByIDAbi =
    "function checkStakeByID(address,bytes16) view returns (uint256 startDay, uint256 lockDays, uint256 finalDay, uint256 closeDay, uint256 scrapeDay, uint256 stakedAmount, uint256 stakesShares, uint256 rewardAmount, uint256 penaltyAmount, bool isActive, bool isMature)";

/**
 * TVL = locked WISE principal in active WiseOne scrapable staking NFTs.
 * Stakes are owned on the WISE token by the NFT contract; principal is burned
 * into share accounting (not an ERC-20 balance on the NFT).
 * Does not include unclaimed accrued interest.
 */
async function tvl(api) {
    const count = await api.call({
        target: WISE,
        abi: stakeCountAbi,
        params: [WISE_NFT_SCRAPABLE],
    });
    if (!count || count === "0" || count === 0) return;

    const ids = await api.call({
        target: WISE,
        abi: stakesPaginationAbi,
        params: [WISE_NFT_SCRAPABLE, 0, count],
    });
    if (!ids || ids.length === 0) return;

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
    api.add(WISE, sum);
}

module.exports = {
    methodology:
        "TVL is locked WISE principal in WiseOne scrapable transferable staking NFTs (0x48791dbdfb38baa58e48329148c321bf33b3c1e1), including long-dated locks up to 15330 days (~42 years). Does not include unclaimed accrued interest (scraping realizes interest by minting WISE; it is not part of staked principal).",
    ethereum: {
        tvl,
    },
};
