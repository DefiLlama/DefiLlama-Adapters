// Citadel Protocol — Assets Under Protection (AUP): sum of Aave V3 collateral for wallets in CitadelRegistry (Arbitrum). Displayed as TVL by DefiLlama but is AUP, not protocol-held assets.
const REGISTRY_ADDRESS = "0x7335a359Adb84a892eb9cD2Dc06977cBFbB69775";
const AAVE_POOL = "0x794a61358D6845594F94dc1DB02A252b5b4814aD"; // Aave V3 Pool Arbitrum
const USDT_ARBITRUM = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";

async function tvl(api) {
  const protectedUsers = await api.call({
    target: REGISTRY_ADDRESS,
    abi: "function getAllUsers() external view returns (address[])",
  });

  if (!protectedUsers?.length) return;
  const users = Array.isArray(protectedUsers) ? protectedUsers : [protectedUsers];

  const userData = await api.multiCall({
    calls: users.map((user) => ({ target: AAVE_POOL, params: [user] })),
    abi: "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
    permitFailure: true,
  });

  let totalCollateralBase = 0n;
  for (const data of userData || []) {
    const raw = data?.totalCollateralBase ?? data?.[0] ?? data;
    if (raw != null && raw !== undefined) totalCollateralBase += BigInt(raw);
  }
  // Aave returns USD in 8 decimals; USDT on Arbitrum is 6 decimals — scale down and add as USDT
  const usdtAmount = totalCollateralBase / 100n; // 1e8 -> 1e6
  if (usdtAmount > 0n) api.add(USDT_ARBITRUM, usdtAmount);
}

module.exports = {
  methodology: "AUP (Assets Under Protection): sum of Aave V3 collateral in USD for all wallets registered in CitadelRegistry on Arbitrum. These are user-held positions monitored by Citadel, not assets held by the protocol.",
  misrepresentedTokens: true,
  timetravel: false,
  doublecounted: true,
  arbitrum: { tvl },
};
