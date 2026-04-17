const { sumTokens2 } = require("../helper/unwrapLPs");

const usdcPools = {
  base: ["0x4D86223a47f4bB294a10D83dDd4EddF7dd6c1FDf"],
  linea: ["0x822bc646032f9CC429cA108F6057705203564664"],
  arbitrum: ["0x04a883d5ADc890357348dB8FA82BBbbE0327CCDA"],
};

const usdc = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  linea: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
  arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
};

const chainTvl = (chain) => async (api) => {
  await sumTokens2({
    api,
    tokens: [usdc[chain]],
    owners: usdcPools[chain],
  });
};

module.exports = {
  methodology:
    "Counts USDC held directly in active AFAI pool contracts on each supported chain. Excludes testnet pools and avoids double counting.",
  base: { tvl: chainTvl("base") },
  linea: { tvl: chainTvl("linea") },
  arbitrum: { tvl: chainTvl("arbitrum") },
};
