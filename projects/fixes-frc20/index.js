// Fixes Inscription Protocol - 𝔉rc20 Treasury Pool: https://fixes.world/
const { callCadence } = require("../helper/chain/flow");

let queryTVLCode = `
import FRC20Indexer from 0xd2abb5dbf5e08666
import FGameLottery from 0xd2abb5dbf5e08666
import FGameLotteryRegistry from 0xd2abb5dbf5e08666
import FGameLotteryFactory from 0xd2abb5dbf5e08666
import FRC20FTShared from 0xd2abb5dbf5e08666
import FRC20Staking from 0xd2abb5dbf5e08666
import FRC20AccountsPool from 0xd2abb5dbf5e08666

access(all)
fun main(): UFix64 {
    let indexer = FRC20Indexer.getIndexer()
    let tokens = indexer.getTokens()
    var totalBalance = 0.0
    // all treasury pool balance
    for tick in tokens {
        let balance = indexer.getPoolBalance(tick: tick)
        totalBalance = totalBalance + balance
    }

    // FLOW lottery jackpot balance
    let registry = FGameLotteryRegistry.borrowRegistry()
    let flowLotteryPoolName = FGameLotteryFactory.getFIXESMintingLotteryPoolName()
    if let poolAddr = registry.getLotteryPoolAddress(flowLotteryPoolName) {
        if let poolRef = FGameLottery.borrowLotteryPool(poolAddr) {
            let jackpotBalance = poolRef.getJackpotPoolBalance()
            totalBalance = totalBalance + jackpotBalance
        }
    }

    // Unclaimed FLOW Reward in the staking reward pool
    let acctsPool = FRC20AccountsPool.borrowAccountsPool()
    let platformStakingTick = FRC20FTShared.getPlatformStakingTickerName()
    if let stakingPoolAddr = acctsPool.getFRC20StakingAddress(tick: platformStakingTick) {
        if let stakingPool = FRC20Staking.borrowPool(stakingPoolAddr) {
            if let detail = stakingPool.getRewardDetails("") {
                totalBalance = totalBalance + detail.totalReward
            }
        }
    }

    return totalBalance
}
`;

async function tvl() {
  try {
    const flowTokenTVL = await callCadence(queryTVLCode, true);
    return { flow: flowTokenTVL };
  } catch (error) {
    throw new Error(
      "Couln't query scripts of fixes 𝔉rc20 treasury pool",
      error
    );
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Counting the flow tokens locked in the treasury pool of each 𝔉rc20 token in the Fixes inscription protocol.",
  flow: {
    tvl,
  },
};
