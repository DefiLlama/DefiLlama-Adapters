const ADDRESSES = require("../helper/coreAssets.json");

async function unirouterLSDTvl(api) {
  const uBTCBalance = await api.call({
    abi: "erc20:totalSupply",
    target: ADDRESSES.bsquared.UBTC,
  });
  return await api.add(ADDRESSES.null, uBTCBalance);
}

module.exports = {
  bsquared: {
    tvl: unirouterLSDTvl,
  },
};
