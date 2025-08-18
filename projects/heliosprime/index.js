const EDP = "0x7633da43dfd4ee5a5da99740f077ca9d97aa0d0e"

const ethTvl = async (api) => {
  const tokens = await api.call({ target: EDP, abi: "address[]:getComponents" })
  return api.sumTokens({ tokens, owner: EDP})
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  methodology:
    "We count liquidity on the pool2, and it counts the staking of native token separtly",
};
