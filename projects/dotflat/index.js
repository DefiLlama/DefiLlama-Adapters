const { staking } = require("../helper/staking");
const sdk = require("@defillama/sdk");

const CDP_ADDRESS = "0xbCf58DE37791eFe60fE87a6d420FE8F7AEA99ef8";
const DEPOSIT_ADDRESS = "0x44881F5ac2938AAaF4260d7DBE18997318788f9f";
const DFC_ADDRESS = "0x1F709Cfa0C409E158C68EdcD32453809c9Eb69EE";

// Uniswap V4 (Ethereum mainnet)
const STATE_VIEW = "0x7ffe42c4a5deea5b0fec41c94c136cf115597227";
const DFC_ETH_POOL_ID =
  "0xCA0A1A9AB72C583A8CCD487E6D8C75BCC62F9792B4C8C5AEDD1707FE2B8BD3CF";

const ETH = "0x0000000000000000000000000000000000000000";

// TVL: ETH collateral locked in CDP positions
async function tvl(api) {
  return api.sumTokens({ owners: [CDP_ADDRESS], tokens: [ETH] });
}

// Pool2: DFC/ETH liquidity in Uniswap V4
// ETH is token0 (lower address), DFC is token1
async function pool2(api) {
  const [slot0Result, liquidityResult] = await Promise.all([
    sdk.api.abi.call({
      target: STATE_VIEW,
      abi: "function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)",
      params: [DFC_ETH_POOL_ID],
      chain: "ethereum",
      block: api.block,
    }),
    sdk.api.abi.call({
      target: STATE_VIEW,
      abi: "function getLiquidity(bytes32 poolId) view returns (uint128 liquidity)",
      params: [DFC_ETH_POOL_ID],
      chain: "ethereum",
      block: api.block,
    }),
  ]);

  const sqrtPriceX96 = BigInt(slot0Result.output.sqrtPriceX96);
  const L = BigInt(liquidityResult.output);

  if (sqrtPriceX96 === 0n || L === 0n) return;

  const Q96 = 2n ** 96n;

  // Full-range approximation: amount0 (ETH) ≈ L * Q96 / sqrtP, amount1 (DFC) ≈ L * sqrtP / Q96
  const ethAmount = (L * Q96) / sqrtPriceX96;
  const dfcAmount = (L * sqrtPriceX96) / Q96;

  api.add(ETH, ethAmount.toString());
  api.add(DFC_ADDRESS, dfcAmount.toString());
}

module.exports = {
  methodology:
    "TVL counts ETH collateral locked in CDP positions. Staking counts DFC locked in yield deposit contracts (earning interest). Pool2 counts DFC/ETH liquidity in the Uniswap V4 pool.",
  start: "2025-01-01",
  ethereum: {
    tvl,
    staking: staking(DEPOSIT_ADDRESS, DFC_ADDRESS),
    pool2,
  },
};
