const LotteryHubAbi = {
    getLotteryBatch: {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "lotteryIds",
                "type": "uint256[]"
            }
        ],
        "name": "getLotteryBatch",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "lotteryId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "manager",
                        "type": "address"
                    },
                    {
                        "components": [
                            {
                                "internalType": "address",
                                "name": "creator",
                                "type": "address"
                            },
                            {
                                "internalType": "enum LotteryKind",
                                "name": "kind",
                                "type": "uint8"
                            },
                            {
                                "internalType": "enum PayoutModel",
                                "name": "model",
                                "type": "uint8"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint256",
                                        "name": "ticketPrice",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "address",
                                        "name": "asset",
                                        "type": "address"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "feeBp",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint24",
                                        "name": "maxTickets",
                                        "type": "uint24"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "startTime",
                                        "type": "uint64"
                                    },
                                    {
                                        "internalType": "uint64",
                                        "name": "endTime",
                                        "type": "uint64"
                                    }
                                ],
                                "internalType": "struct LotteryParams",
                                "name": "params",
                                "type": "tuple"
                            },
                            {
                                "internalType": "uint256",
                                "name": "payoutRateBp",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "cltAmountPerTicket",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "feederSuperLotteryId",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "feederAllocBp",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct Lottery",
                        "name": "lottery",
                        "type": "tuple"
                    },
                    {
                        "components": [
                            {
                                "internalType": "enum LotteryStatus",
                                "name": "status",
                                "type": "uint8"
                            },
                            {
                                "internalType": "uint64",
                                "name": "drawDeadline",
                                "type": "uint64"
                            },
                            {
                                "internalType": "uint32",
                                "name": "drawGeneration",
                                "type": "uint32"
                            },
                            {
                                "internalType": "uint256",
                                "name": "seed",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "referrerFees",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "creatorFees",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "prizePool",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "claimedPrizePool",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "currentPrizePool",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct LotteryStateView",
                        "name": "state",
                        "type": "tuple"
                    },
                    {
                        "internalType": "uint256",
                        "name": "ticketsSold",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint16[]",
                        "name": "tiers",
                        "type": "uint16[]"
                    }
                ],
                "internalType": "struct LotteryFullInfo[]",
                "name": "results",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
}

const LOTTERY_HUB = '0x4958CB13Fa5881B2c67bde408708e72411Bb3bbb'
const BATCH_SIZE = 100

/**
 * Sums the remaining prize pool (`currentPrizePool`) of every lottery registered in the LotteryHub.
 * Lottery IDs are enumerated on-chain via `lotteryCount()` and fetched in batches of `BATCH_SIZE`.
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

    const batches = await api.multiCall({ abi: LotteryHubAbi.getLotteryBatch, target: LOTTERY_HUB, calls })
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
