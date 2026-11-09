const getLotteryBatchAbi = 'function getLotteryBatch(uint256[] lotteryIds) view returns (tuple(uint256 lotteryId, address manager, tuple(address creator, uint8 kind, uint8 model, tuple(uint256 ticketPrice, address asset, uint256 feeBp, uint24 maxTickets, uint64 startTime, uint64 endTime) params, uint256 payoutRateBp, uint256 cltAmountPerTicket, uint256 feederSuperLotteryId, uint256 feederAllocBp) lottery, tuple(uint8 status, uint64 drawDeadline, uint32 drawGeneration, uint256 seed, uint256 referrerFees, uint256 creatorFees, uint256 prizePool, uint256 claimedPrizePool, uint256 currentPrizePool) state, uint256 ticketsSold, uint16[] tiers)[] results)'

const LOTTERY_HUB = '0x4958CB13Fa5881B2c67bde408708e72411Bb3bbb'
const BATCH_SIZE = 100

/**
 * Sums the remaining prize pool (`currentPrizePool`) of every lottery registered in the LotteryHub.
 * Lottery IDs are enumerated on-chain via `lotteryCount()` and fetched in batches of `BATCH_SIZE`.
 * Manager balances are not used: they also hold refunds, creator fees, referral revenue share and treasury funds.
 * @param {import('@defillama/sdk').ChainApi} api - DefiLlama chain API for the target chain and block
 */
async function tvl(api) {
    const lotteryCount = Number(await api.call({ abi: 'uint256:lotteryCount', target: LOTTERY_HUB }))
    if (!lotteryCount) return

    // lottery IDs are sequential: 1..lotteryCount
    const ids = Array.from({ length: lotteryCount }, (_, i) => i + 1)
    const calls = []
    for (let i = 0; i < ids.length; i += BATCH_SIZE)
        calls.push({ params: [ids.slice(i, i + BATCH_SIZE)] })

    const batches = await api.multiCall({ abi: getLotteryBatchAbi, target: LOTTERY_HUB, calls })
    for (const lottery of batches.flat())
        api.add(lottery.lottery.params.asset, lottery.state.currentPrizePool)
}

module.exports = {
    methodology: "TVL is the sum of the remaining prize pools (prize pool minus already claimed prizes) of all lotteries registered in the LotteryHub contract, read on-chain on each supported chain.",
    start: '2026-10-27',
}

;['ethereum', 'bsc', 'base'].forEach(chain => {
    module.exports[chain] = { tvl }
})
