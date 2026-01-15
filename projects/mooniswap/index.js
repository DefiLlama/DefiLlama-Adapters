const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')

const factoryContract = "0x71CD6666064C3A1354a3B4dca5fA1E2D3ee7D303";

const ethTvl = async (api) => {

  const pools = await api.call({ abi: abi.getAllPools, target: factoryContract, })
  const res = await api.multiCall({ abi: abi.getTokens, calls: pools, })
  const ownerTokens = res.map((r, i) => [r, pools[i]])
  return sumTokens2({ ownerTokens, api })
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  methodology: "Counts tvl on all AMM Pools through Factory Contract",
};
