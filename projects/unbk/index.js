const {fyields} = require("./fantom-yields");
const { routerAbi } = require("./router-abi");

async function tvl(api) {
  const tokens = fyields.map(i => i.yieldBearingAsset)
  const calls = fyields.map(i => ({ target: i.router, params: [i.yieldBearingAsset, i.yieldProxy] }))
  const bals = await api.multiCall({  abi: routerAbi, calls })
  api.add(tokens, bals)
}

module.exports = {
      methodology:
    "Accross different vaults, counts the total number of assets accumulated on each of them",
  fantom: {
    tvl,
  },
};
