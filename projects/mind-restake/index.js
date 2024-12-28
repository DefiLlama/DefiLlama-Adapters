const config = {
  ethereum: "0x6a5D488EC17d6a7a1872AaB88feC90c1B2Df4196",
  scroll: "0xea3E87699D11B77Fba754Bf0257a25664B97437d",
  bsc: "0x6a5D488EC17d6a7a1872AaB88feC90c1B2Df4196",
};

module.exports = {
  methodology: "Counts the total amount of asset tokens deposited in each of the Strategy contracts registered in the helper contract on each chain.",
}

Object.keys(config).forEach(chain => {
  const target = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const [_vaults, tokens, bals] = await api.call({
        abi: "function getPoolTotalAssets() view returns (address[] memory,address[] memory, uint256[] memory)",
        target,
      })
      api.add(tokens, bals)
    }
  }
})
