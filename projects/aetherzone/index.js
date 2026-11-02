const { sumTokens2 } = require("../helper/unwrapLPs");

const TOKENS = {
  WSHIDO: "0x8cbaffd9b658997e7bf87e98febf6ea6917166f7",
  USDC: "0xeE1Fc22381e6B6bb5ee3bf6B5ec58DF6F5480dF8",
  CWK: "0xdB798cF512Af4F7E41AE4Bf4b7f20CDF74Bc21f9",
  CHINA: "0xa907bE8aEFF41D593dC33A29C0CBAbEbD8beC03B",
};

// Factory registries for dynamic pool discovery
const FACTORIES = [
  "0x386bfd9d4f2BC9BCBA56194E776510917570C01C", // AetherStakeFactory V7
  "0x59eE0da93DE70A6bE9C597089Cc01A2a2f499085", // StakePoolFactory V6
];

// Static protocol infrastructure (Escrows, Gauges, Treasury Vaults)
const STATIC_CONTRACTS = [
  "0x3B3d1C18b61A40F057956f43bC501D94473fFE10", // AetherZone DAO Treasury
  "0xCC532A532857ad5CC0A1d6726062Acc75554344D", // RevenueDistributor V2
  "0xDc812945b24E27BA5DBe17C71329a355Cd575239", // AetherOTC Escrow
  "0xECbd5f2dfe7033f2c62E2FfB668b600d96946E20", // AetherLPGauge
  "0x4AE8907e183DEfD989adF86529491627DE714B0e", // AetherReserveEscrow
  "0xfdF721b2b44dA4e112c8daE16B320D47E63955a8", // AetherFund Pool
];

const CWK_WSHIDO_POOL = "0x617495ea61B79032437774a7a0C58795C74aEEe3";
const CHINA_WSHIDO_POOL = "0xF5C547C7821eE9B836E2A5a6d08cE74B15F94D47";
const Q192 = 2n ** 192n;

async function tvl(api) {
  // 1. Dynamically discover all pools from V6 and V7 factories
  const dynamicPools = [];
  for (const factory of FACTORIES) {
    try {
      const pools = await api.fetchList({
        lengthAbi: "uint256:poolsCount",
        itemAbi: "function allPools(uint256) view returns (address)",
        target: factory,
      });
      dynamicPools.push(...pools);
    } catch (e) {}
  }

  const allOwners = [...new Set([...dynamicPools, ...STATIC_CONTRACTS])];

  // 2. Fetch raw balances across all discovered pools, treasuries, and escrows
  await sumTokens2({
    api,
    owners: allOwners,
    tokens: Object.values(TOKENS),
  });

  // 3. Resolve CWK and CHINA balances to WSHIDO equivalent via Uniswap V3 pools
  const balances = api.getBalances();
  const cwkKey = `shido:${TOKENS.CWK.toLowerCase()}`;
  const chinaKey = `shido:${TOKENS.CHINA.toLowerCase()}`;
  const cwkBal = balances[cwkKey] ? BigInt(balances[cwkKey]) : 0n;
  const chinaBal = balances[chinaKey] ? BigInt(balances[chinaKey]) : 0n;

  if (cwkBal > 0n) {
    try {
      const slot0 = await api.call({
        abi: "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)",
        target: CWK_WSHIDO_POOL,
      });
      const sqrtPrice = BigInt(slot0.sqrtPriceX96);
      const cwkInWshido = (cwkBal * Q192) / (sqrtPrice * sqrtPrice);
      api.add(TOKENS.WSHIDO, cwkInWshido);
      delete balances[cwkKey];
    } catch (e) {}
  }

  if (chinaBal > 0n) {
    try {
      const slot0 = await api.call({
        abi: "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)",
        target: CHINA_WSHIDO_POOL,
      });
      const sqrtPrice = BigInt(slot0.sqrtPriceX96);
      const chinaInWshido = (chinaBal * Q192) / (sqrtPrice * sqrtPrice);
      api.add(TOKENS.WSHIDO, chinaInWshido);
      delete balances[chinaKey];
    } catch (e) {}
  }

  return api.getBalances();
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL counts assets dynamically discovered across all AetherZone staking factory pools (V6 and V7), DAO treasury vaults, OTC trade escrows, and platform contracts. Unlisted token balances (CWK, CHINA) are priced via their canonical Uniswap V3 pools against WSHIDO on Shido DEX.",
  shido: {
    tvl,
  },
};
