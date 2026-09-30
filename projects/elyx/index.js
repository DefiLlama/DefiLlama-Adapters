const VAULT = "0x39F39D48cF4C89D591Fc890f0fF531B0B67c31BC"; // dHEDGE PoolLogic

// getFundSummary() reverts with "Price get failed" (the vault's price oracle is down), so the
// vault's supported assets are read from its PoolManagerLogic and their balances summed directly
const tvl = async (api) => {
  const managerLogic = await api.call({ abi: 'address:poolManagerLogic', target: VAULT })
  const assets = await api.call({ abi: 'function getSupportedAssets() view returns (tuple(address asset, bool isDeposit)[])', target: managerLogic })
  return api.sumTokens({ owner: VAULT, tokens: assets.map(i => i.asset) })
};

module.exports = {
  nibiru: {
    tvl,
  },
  methodology: "Aggregates total value of Elyx' Nibiru vault (based on dHEDGE)",
};
