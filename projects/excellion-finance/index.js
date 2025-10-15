const VAULT = "0xb8a14b03900828f863aedd9dd905363863bc31f4";
const USDC = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
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
