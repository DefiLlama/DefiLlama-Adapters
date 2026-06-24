const { getConfig } = require("../helper/cache");

// T3tris ecosystem API — authoritative list of vaults with curation flags
const VAULTS_API = "https://ecosystem.t3tris.finance/vaults";
const getGrossTvlAbi = "function getGrossTVL() external view returns (uint256 totalManagedAssets, uint256 pendingDeposits, uint256 claimableRedeems, uint256 grossTVL)";
const CHAINS = ['arbitrum'];

async function getVerifiedVaults(chainId) {
  const all = await getConfig("t3tris-finance/vaults", VAULTS_API);
  return (all || []).filter(
    (v) =>
      v?.verified &&
      !v?.blacklisted &&
      Number(v?.chainId) === chainId &&
      typeof v?.address === "string" &&
      v.address &&
      typeof v?.asset === "string" &&
      v.asset,
  ); 
}

async function tvl(api) {
  const vaults = await getVerifiedVaults(api.chainId);

  const grossTvls = await api.multiCall({
    abi: getGrossTvlAbi,
    calls: vaults.map((v) => v.address),
    permitFailure: true,
  });

  for (let i = 0; i < vaults.length; i++) {
    const g = grossTvls[i];
    const token = vaults[i].asset;
    if (g) api.add(token, g.grossTvl || g[3]);
  }
}

module.exports = {
  methodology: "Vaults are sourced from the T3tris ecosystem API; only verified, non-blacklisted vaults are counted. TVL = totalManagedAssets (assets deployed in strategies, per oracle NAV) + pendingDeposits (async deposit requests in yield-bearing depositSilo) + claimableRedeems (settled redemptions in yield-bearing redeemSilo), read on-chain per vault via getGrossTVL() and summed per underlying token.",
};

CHAINS.forEach((chain) => {
  module.exports[chain] = { tvl };
}); 
