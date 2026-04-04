const { staking } = require("../helper/staking");

const PHUSD = "0xf3B5B661b92B75C71fA5Aba8Fd95D7514A9CD605";
const PHLIMBO = "0x3984eBC84d45a889dDAc595d13dc0aC2E54819F4";

const strategies = [
  "0xE7aEC21BF6420FF483107adCB9360C4b31d69D78", // YieldStrategyDola
  "0x8b4A75290A1C4935eC1dfd990374AC4BD4D33952", // YieldStrategyUSDC
];

const vaults = [
  "0x79eB84B5E30Ef2481c8f00fD0Aa7aAd6Ac0AA54d", // AutoDOLA
  "0xa7569A44f348d3D70d8ad5889e50F78E33d80D35", // AutoUSDC
];

async function tvl(api) {
  const shares = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: vaults.map((vault, i) => ({ target: vault, params: strategies[i] })),
  });

  const assets = await api.multiCall({
    abi: "function convertToAssets(uint256) view returns (uint256)",
    calls: vaults.map((vault, i) => ({ target: vault, params: shares[i] })),
  });

  const tokens = await api.multiCall({ abi: "address:asset", calls: vaults });

  tokens.forEach((token, i) => api.add(token, assets[i]));
}

module.exports = {
  methodology:
    "TVL is the underlying stablecoins (DOLA, USDC) held in ERC4626 yield strategies via PhusdStableMinter. Staking is phUSD deposited in the Phlimbo yield farm.",
  ethereum: {
    tvl,
    staking: staking(PHLIMBO, PHUSD),
  },
};
