const HELPER_CONTRACTS = {
  ethereum: "0x6a5D488EC17d6a7a1872AaB88feC90c1B2Df4196",
  scroll: "0xea3E87699D11B77Fba754Bf0257a25664B97437d"
};

async function tvl(api) {
  const target = HELPER_CONTRACTS[api.chain];
  const [, tokenList, totalList] = await api.call({
    abi: "function getPoolTotalAssets() view returns (address[] memory,address[] memory, uint256[] memory)",
    target,
    params: [],
  });

  tokenList.map((token, idx) => api.add(token, totalList[idx]))
}

module.exports = {
  methodology: "Counts the total amount of asset tokens deposited in each of the Strategy contracts registered in the helper contract on each chain.",
  ethereum: {
    tvl,
  },
  scroll: {
    tvl
  }
};
