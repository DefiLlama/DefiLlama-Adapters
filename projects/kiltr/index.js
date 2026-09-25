const { onChainTvl } = require("../helper/balancer");
const { getLogs } = require("../helper/cache/getLogs");

const V2_VAULT = "0x8d1addff942c185e81848a19203b994f5cf07df2";
const V3_VAULT = "0x371bd29a7befc4efcdfa2c5261316c74843573d3";
const V2_START = 67292293;
const V3_START = 67292959;

const v2Tvl = onChainTvl(V2_VAULT, V2_START);

async function tvl(api) {
  await v2Tvl(api);
  const v3Pools = await getLogs({
    api, target: V3_VAULT, fromBlock: V3_START, onlyArgs: true, extraKey: "v3-pool-registered",
    eventAbi: "event PoolRegistered(address indexed pool, address indexed factory, (address token, uint8 tokenType, address rateProvider, bool paysYieldFees)[] tokenConfig, uint256 swapFeePercentage, uint32 pauseWindowEndTime, (address pauseManager, address swapFeeManager, address poolCreator) roleAccounts, (bool enableHookAdjustedAmounts, bool shouldCallBeforeInitialize, bool shouldCallAfterInitialize, bool shouldCallComputeDynamicSwapFee, bool shouldCallBeforeSwap, bool shouldCallAfterSwap, bool shouldCallBeforeAddLiquidity, bool shouldCallAfterAddLiquidity, bool shouldCallBeforeRemoveLiquidity, bool shouldCallAfterRemoveLiquidity, address hooksContract) hooksConfig, (bool disableUnbalancedLiquidity, bool enableAddLiquidityCustom, bool enableRemoveLiquidityCustom, bool enableDonation) liquidityManagement)",
  });
  const tokens = v3Pools.flatMap((p) => p.tokenConfig.map((t) => t.token));
  return api.sumTokens({ owner: V3_VAULT, tokens, blacklistedTokens: v3Pools.map((p) => p.pool) });
}

module.exports = {
  methodology: "TVL is the sum of every pool token held by the Kiltr v2 and v3 Vaults (Balancer-style single-Vault architecture). Pool tokens (BPT/KPT) held by the Vaults are excluded.",
  start: "2026-09-19",
  robinhood: { tvl },
};
