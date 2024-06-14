// Fixes Inscription Protocol - 𝔉rc20 Treasury Pool: https://fixes.world/
const { post } = require("../helper/http");

let queryTVLCode = `
import FRC20Indexer from 0xd2abb5dbf5e08666
import FGameLottery from 0xd2abb5dbf5e08666
import FGameLotteryRegistry from 0xd2abb5dbf5e08666
import FGameLotteryFactory from 0xd2abb5dbf5e08666

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
    return totalBalance
}
`;

const queryCodeBase64 = Buffer.from(queryTVLCode, "utf-8").toString("base64");

async function tvl() {
  try {
    const response = await post(
      "https://rest-mainnet.onflow.org/v1/scripts",
      { script: queryCodeBase64 },
      {
        headers: { "content-type": "application/json" },
      }
    );
    let resEncoded = response;
    let resString = Buffer.from(resEncoded, "base64").toString("utf-8");
    let resJson = JSON.parse(resString);
    let flowTokenTVL = Number(resJson.value);

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
