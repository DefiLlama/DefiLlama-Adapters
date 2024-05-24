const ADDRESSES = require("../helper/coreAssets.json");

async function unirouterLSDTvl(api) {
  const uBTCBalance = await api.call({
    abi: "erc20:totalSupply",
    target: "0x796e4D53067FF374B89b2Ac101ce0c1f72ccaAc2",
  });
  return await api.add(ADDRESSES.null, uBTCBalance);
}

module.exports = {
  bsquared: {
    tvl: unirouterLSDTvl,
  },
};
