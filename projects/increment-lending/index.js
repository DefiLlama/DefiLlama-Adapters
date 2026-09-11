const { callCadence } = require("../helper/chain/flow");

// Queries each lending pool's cash + borrows via on-chain Cadence script.
const script = `
import LendingInterfaces from 0x2df970b6cdee5735
import LendingConfig from 0x2df970b6cdee5735

access(all) view fun main(): [UFix64] {
    let comptrollerRef = getAccount(0xf80cb737bfe7c792)
        .capabilities.borrow<&{LendingInterfaces.ComptrollerPublic}>(/public/comptrollerModule)
        ?? panic("Cannot borrow LendingComptroller")

    let oracleRef = getAccount(0x72d3a05910b6ffa3)
        .capabilities.borrow<&{LendingInterfaces.OraclePublic}>(/public/oracleModule)
        ?? panic("Cannot borrow LendingOracle")

    var totalCashUSD: UFix64 = 0.0
    var totalBorrowUSD: UFix64 = 0.0

    for poolAddr in comptrollerRef.getAllMarkets() {
        if let poolRef = getAccount(poolAddr)
            .capabilities.borrow<&{LendingInterfaces.PoolPublic}>(/public/incrementLendingPoolPublic) {

            let price = oracleRef.getUnderlyingPrice(pool: poolAddr)
            if price != 0.0 {
                let cashScaled = poolRef.getPoolCash()
                let borrowScaled = poolRef.getPoolTotalBorrowsScaled()
                totalCashUSD = totalCashUSD + LendingConfig.ScaledUInt256ToUFix64(cashScaled) * price
                totalBorrowUSD = totalBorrowUSD + LendingConfig.ScaledUInt256ToUFix64(borrowScaled) * price
            }
        }
    }

    return [totalCashUSD, totalBorrowUSD]
}
`;

let _cachedData;
async function fetchMarketData () {
  if (!_cachedData) {
    _cachedData = callCadence(script).then((result) => {
      const vals = result.value;
      return {
        cashUSD: parseFloat(vals[0].value),
        borrowUSD: parseFloat(vals[1].value),
      };
    });
    _cachedData.catch(() => { _cachedData = null; });
  }
  return _cachedData;
}

async function tvl (api) {
  const { cashUSD } = await fetchMarketData();
  api.addUSDValue(cashUSD);
}

async function borrowed (api) {
  const { borrowUSD } = await fetchMarketData();
  api.addUSDValue(borrowUSD);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Counting the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed funds are not counted in the TVL, so only the tokens actually locked in the contracts are counted.",
  flow: { tvl, borrowed },
};
