const getLotteryBatchAbi = 'function getLotteryBatch(uint256[] lotteryIds) view returns (tuple(uint256 lotteryId, address manager, tuple(address creator, uint8 kind, uint8 model, tuple(uint256 ticketPrice, address asset, uint256 feeBp, uint24 maxTickets, uint64 startTime, uint64 endTime) params, uint256 payoutRateBp, uint256 cltAmountPerTicket, uint256 feederSuperLotteryId, uint256 feederAllocBp) lottery, tuple(uint8 status, uint64 drawDeadline, uint32 drawGeneration, uint256 seed, uint256 referrerFees, uint256 creatorFees, uint256 prizePool, uint256 claimedPrizePool, uint256 currentPrizePool) state, uint256 ticketsSold, uint16[] tiers)[] results)'

const getSuperFeederContextAbi = 'function getSuperFeederContext(uint256 superLotteryId) view returns (uint16 superFeeBp, bool acceptsFeeding, address prizeAsset, uint64 superEndTime)'

const LOTTERY_HUB = '0x4958CB13Fa5881B2c67bde408708e72411Bb3bbb'
const BATCH_SIZE = 100
const SUPER_KIND = 3 // LotteryKind.SUPER
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

/**
 * Sums the remaining prize pool (`currentPrizePool`) of every lottery registered in the LotteryHub.
 * Lottery IDs are enumerated on-chain via `lotteryCount()` and fetched in batches of `BATCH_SIZE`.
 * SUPER lotteries sell tickets in CLT, but their prize pool is held in the feeders' ERC-20, which is
 * read from the lottery manager via `getSuperFeederContext()`; every other kind uses `params.asset`.
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
    const lotteries = batches.flat().filter(l => BigInt(l.state.currentPrizePool) > 0n)

    const supers = lotteries.filter(l => Number(l.lottery.kind) === SUPER_KIND)
    const superContexts = await api.multiCall({
        abi: getSuperFeederContextAbi,
        calls: supers.map(l => ({ target: l.manager, params: [l.lotteryId] })),
    })
    const superPrizeAsset = {}
    supers.forEach((l, i) => superPrizeAsset[l.lotteryId] = superContexts[i].prizeAsset)

    for (const lottery of lotteries) {
        let asset = lottery.lottery.params.asset
        // mirrors ProtocolLotteryManager._prizeAsset: fall back to params.asset until a feeder sets the prize asset
        const prizeAsset = superPrizeAsset[lottery.lotteryId]
        if (prizeAsset && prizeAsset !== ZERO_ADDRESS) asset = prizeAsset
        api.add(asset, lottery.state.currentPrizePool)
    }
}

module.exports = {
    methodology: "TVL is the sum of the remaining prize pools (prize pool minus already claimed prizes) of all lotteries registered in the LotteryHub contract, read on-chain on each supported chain. Prize pools are valued in the prize asset: the ticket asset for regular, user and battle lotteries, and the feeder ERC-20 for super lotteries (whose tickets are paid in CLT).",
    start: '2026-10-27',
}

;['ethereum', 'bsc', 'base'].forEach(chain => {
    module.exports[chain] = { tvl }
})
