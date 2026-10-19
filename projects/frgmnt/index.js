const POOL = "0x704c56974e0CA4BF8ff8fe8acc51FBF1E053878E";

const FUND_SUMMARY_ABI =
  "function getFundSummary() view returns (tuple(string name, uint256 totalSupply, uint256 totalFundValue, address manager, string managerName, uint256 creationTime, bool privatePool, uint256 performanceFeeNumerator, uint256 managerFeeNumerator, uint256 exitFeeNumerator, uint256 entryFeeNumerator, uint256 feeDenominator))";

async function tvl(api) {
  const summary = await api.call({ target: POOL, abi: FUND_SUMMARY_ABI });
  // Normalize the 1e18-scaled uint256 in BigInt before converting to Number,
  // so large fund values don't lose precision past Number.MAX_SAFE_INTEGER.
  api.addUSDValue(Number(BigInt(summary.totalFundValue) / 10n ** 12n) / 1e6);
}

module.exports = {
  methodology:
    "TVL is the protocol's on-chain total fund value (totalFundValue from PoolLogic.getFundSummary), i.e. the USD value of the collateral backing fUSD/sfUSD. The collateral is deployed into external stablecoin-lending strategies, so TVL is flagged as double-counted.",
  doublecounted: true,
  base: { tvl },
};
