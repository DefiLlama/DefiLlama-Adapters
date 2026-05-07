const ADDRESSES = require('../helper/coreAssets.json')
const VAULT = "0xb8a14b03900828f863aedd9dd905363863bc31f4";
const USDC = ADDRESSES.avax.USDC;
const totalAssetsAbi = "uint256:totalAssets";

async function tvl(api) {
  const totalAssets = await api.call({
    target: VAULT,
    abi: totalAssetsAbi,
    chain: "avax",
  });
  api.add(USDC, totalAssets);
  return api.getBalances();
}

module.exports = {
  avax: { tvl },
  methodology:
    "Count all assets are deposited in Lagoon vault curated by Excellion Finance.",
};
