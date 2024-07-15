// Fixes Inscription Protocol - 𝔉rc20 Treasury Pool: https://fixes.world/
const { post } = require("../helper/http");

let queryTVLCode = `
import LiquidStaking from 0xd6f80565193ad727
import stFlowToken from 0xd6f80565193ad727
// Fixes Imports
import FRC20AccountsPool from 0xd2abb5dbf5e08666
import FixesFungibleTokenInterface from 0xd2abb5dbf5e08666
import FixesTokenLockDrops from 0xd2abb5dbf5e08666
import FixesTradablePool from 0xd2abb5dbf5e08666
import FRC20Indexer from 0xd2abb5dbf5e08666

access(all)
fun main(): UFix64 {
    // singleton resource and constants
    let acctsPool = FRC20AccountsPool.borrowAccountsPool()
    let frc20Indexer = FRC20Indexer.getIndexer()
    let stFlowTokenKey = "@".concat(Type<@stFlowToken.Vault>().identifier)

    // dictionary of addresses
    let addrsDict = acctsPool.getAddresses(type: FRC20AccountsPool.ChildAccountType.FungibleToken)
    // dictionary of tickers and total locked token balances
    let tickerTotal: {String: UFix64} = {}
    // This is the soft burned LP value which is fully locked in the BlackHole Vault
    var flowLockedInBondingCurve = 0.0
    addrsDict.forEachKey(fun (key: String): Bool {
        if let addr = addrsDict[key] {
            // sum up all locked token balances in LockDrops Pool
            if let dropsPool = FixesTokenLockDrops.borrowDropsPool(addr) {
                let lockedTokenSymbol = dropsPool.getLockingTokenTicker()
                tickerTotal[lockedTokenSymbol] = (tickerTotal[lockedTokenSymbol] ?? 0.0) + dropsPool.getTotalLockedTokenBalance()
            }
            // sum up all burned LP value in Tradable Pool
            if let tradablePool = FixesTradablePool.borrowTradablePool(addr) {
                flowLockedInBondingCurve = flowLockedInBondingCurve + tradablePool.getFlowBalanceInPool()
            }
        }
        return true
    })
    // sum up all locked token balances in LockDrops Pool
    var totalLockingTokenTVL = 0.0
    tickerTotal.forEachKey(fun (key: String): Bool {
        let lockedAmount = tickerTotal[key]!
        if key == "" {
            // this is locked FLOW
            totalLockingTokenTVL = totalLockingTokenTVL + lockedAmount
        } else if key == "fixes" {
            // this is locked FIXES
            let price = frc20Indexer.getBenchmarkValue(tick: "fixes")
            totalLockingTokenTVL = totalLockingTokenTVL + lockedAmount * price
        } else if key == stFlowTokenKey {
            // this is locked stFlow
            totalLockingTokenTVL = totalLockingTokenTVL + LiquidStaking.calcFlowFromStFlow(stFlowAmount: lockedAmount)
        }
        return true
    })
    return totalLockingTokenTVL + flowLockedInBondingCurve
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
    throw new Error("Couln't query scripts of Fixes coins", error);
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Counting the $FLOW token locked in Fixes Coins' Bonding Curve, and Fixes Coins' LockDrop Pool.",
  flow: {
    tvl,
  },
};
