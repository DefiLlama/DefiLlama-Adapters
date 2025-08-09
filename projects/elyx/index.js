const DHEDGE_V2_VAULT_SUMMARY_ABI =
  "function getFundSummary() view returns (tuple(string name, uint256 totalSupply, uint256 totalFundValue))";

const tvl = async (api) => {
  const target = "0xcE5324108106a6d64EB954706875cd59696188C3";
  const summary = await api.call({ abi: DHEDGE_V2_VAULT_SUMMARY_ABI, target, })
  const totalValueLocked = summary?.totalFundValue ?? 0;
  return {
    tether: totalValueLocked / 1e18,
  };
};

module.exports = {
  nibiru: {
    tvl,
  },
  misrepresentedTokens: true,
  methodology: "Aggregates total value of Elyx' Nibiru vault (based on dHEDGE)",
};
