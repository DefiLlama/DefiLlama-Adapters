const ADDRESSES = require("../helper/coreAssets.json");

const getFraction = "function fraction() view returns (uint128 base, uint128 elastic)";

async function tvl(api) {
  const { elastic } = await api.call({ abi: getFraction, target: '0x24ae2da0f361aa4be46b48eb19c91e02c5e4f27e' })
  api.add(ADDRESSES.null, elastic)
  return api.getBalances()
}

module.exports = {
  methodology:
    "Staked tokens are counted as TVL based on the chain that they are staked on and where the liquidity tokens are issued",
  doublecounted: true,
  ethereum: {
    tvl,
  },
};
