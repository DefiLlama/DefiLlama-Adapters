// BUCK Protocol — yield-bearing savings coin
// TVL = on-chain USDC reserves (R) + attested STRC portfolio value (V)
// Both values are read from on-chain contracts.

const ADDRESSES = require("../helper/coreAssets.json");

const COLLATERAL_ATTESTATION = "0x1aEEEf99704258947A9ea77eF021d5e0551c0428";
const LIQUIDITY_RESERVE = "0x1A426E3A87368a4851f7443Ff656A054Af872f66";

async function tvl(api) {
  // R: USDC held in LiquidityReserve (6 decimals)
  const lrUsdc = await api.call({
    abi: "erc20:balanceOf",
    target: ADDRESSES.ethereum.USDC,
    params: [LIQUIDITY_RESERVE],
  });
  api.add(ADDRESSES.ethereum.USDC, lrUsdc);

  // V: attested off-chain STRC portfolio value (18 decimals, USD-denominated)
  const v = await api.call({
    abi: "function V() view returns (uint256)",
    target: COLLATERAL_ATTESTATION,
  });
  // V is already USD-denominated with 18 decimals — add as USDC equivalent
  // Divide by 1e12 to convert from 18 decimals to 6 decimals (USDC)
  api.add(ADDRESSES.ethereum.USDC, v / 1e12);
}

module.exports = {
  start: 1741190400, // March 5, 2026 — BUCK mainnet launch
  methodology:
    "TVL is the total collateral backing BUCK: on-chain USDC in the LiquidityReserve plus the attested off-chain STRC (Strategy preferred stock) portfolio value from the CollateralAttestation contract.",
  ethereum: { tvl },
};
