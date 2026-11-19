const { sumTokens2 } = require('../helper/unwrapLPs')

const getLotteryBatchAbi = 'function getLotteryBatch(uint256[] lotteryIds) view returns (tuple(uint256 lotteryId, address manager, tuple(address creator, uint8 kind, uint8 model, tuple(uint256 ticketPrice, address asset, uint256 feeBp, uint24 maxTickets, uint64 startTime, uint64 endTime) params, uint256 payoutRateBp, uint256 cltAmountPerTicket, uint256 feederSuperLotteryId, uint256 feederAllocBp) lottery, tuple(uint8 status, uint64 drawDeadline, uint32 drawGeneration, uint256 seed, uint256 referrerFees, uint256 creatorFees, uint256 prizePool, uint256 claimedPrizePool, uint256 currentPrizePool) state, uint256 ticketsSold, uint16[] tiers)[] results)'

const LOTTERY_HUB = '0x4958CB13Fa5881B2c67bde408708e72411Bb3bbb'
const BATCH_SIZE = 100

// Lottery managers and ticket assets are discovered from the LotteryHub; TVL is the managers' balances of those assets.
// SUPER lotteries are funded by REGULAR feeder lotteries, so their prize assets are already among the ticket assets.
async function tvl(api) {
    const lotteryCount = Number(await api.call({ abi: 'uint256:lotteryCount', target: LOTTERY_HUB }))
    if (!lotteryCount) return

    // lottery IDs are sequential: 1..lotteryCount
    const ids = Array.from({ length: lotteryCount }, (_, i) => i + 1)
    const calls = []
    for (let i = 0; i < ids.length; i += BATCH_SIZE)
        calls.push({ params: [ids.slice(i, i + BATCH_SIZE)] })

    const lotteries = (await api.multiCall({ abi: getLotteryBatchAbi, target: LOTTERY_HUB, calls })).flat()
    const owners = [...new Set(lotteries.map(l => l.manager))]
    const tokens = [...new Set(lotteries.map(l => l.lottery.params.asset))]
    return sumTokens2({ api, owners, tokens })
}

module.exports = {
    methodology: "TVL is the balance of the lottery assets (ticket and prize tokens) held by the CoinLotto lottery manager contracts registered in the LotteryHub. This covers prize pools awaiting draws and claims, plus creator and referrer fees not yet withdrawn.",
    start: '2026-10-27',
}

;['ethereum', 'bsc', 'base'].forEach(chain => {
    module.exports[chain] = { tvl }
})
