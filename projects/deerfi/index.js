const abi = require("./abi.json");

const factoryContract = "0xa22F8cf50D9827Daef24dCb5BAC92C147a9D342e";

const ethTvl = async (api) => {
  const pools = await api.fetchList({  lengthAbi: abi.allPoolsLength, itemAbi: abi.allPools, target: factoryContract})
  const tokens = await api.multiCall({  abi: abi.token, calls: pools })
  const bals  = await api.multiCall({  abi: abi.reserve, calls: pools })
  api.add(tokens, bals)
};

module.exports = {
  deadFrom: 1648765747,
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology:
    "Counts tvl on all the Pools through Factory Contract",
};
