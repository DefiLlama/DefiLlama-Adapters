const { sumTokens2 } = require("../helper/unwrapLPs");

// PredictEX perpetual manager (proxy) on Base. All collateral backing the
// exchange (liquidity pool cash, trader margin) is held by this contract.
const PERPETUAL_MANAGER = "0x38c4E93bac87b2fb96931dAB876Bb683D388f1A8";

const abi = {
  getPoolStaticInfo:
    "function getPoolStaticInfo(uint8 _poolFromIdx, uint8 _poolToIdx) view returns (uint24[][] perpetualIds, address[] shareTokens, address[] marginTokens, address oracleFactory)",
};

async function tvl(api) {
  const { marginTokens } = await api.call({
    abi: abi.getPoolStaticInfo,
    target: PERPETUAL_MANAGER,
    params: [1, 255],
  });
  return sumTokens2({ api, owner: PERPETUAL_MANAGER, tokens: marginTokens });
}

module.exports = {
  methodology:
    "TVL is the collateral (USDC) held by the PredictEX exchange contract on Base, which backs all prediction markets: liquidity provided to the market-making pool and margin deposited by traders. Margin tokens are enumerated from the exchange's liquidity pools on-chain.",
  start: "2026-03-31",
  base: { tvl },
};
