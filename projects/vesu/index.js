const { multiCall, sumTokens } = require("../helper/chain/starknet");
const { abi, allAbi } = require("./abi");

const poolAddress =
  "0x02545b2e5d519fc230e9cd781046d3a64e092114f07e44771e0d719d148725ef";

const assets = [
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
  "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
  "0x042b8f0484674ca266ac5d08e4ac6a3fe65bd3129795def2dca5c34ecc5f96d2",
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
];

const poolId = "0x4dc4f0ca6ea4961e4c8373265bfd5317678f4fe374d76f3fd7135f57763bf28";

async function tvl(api) {
  return sumTokens({ api, owner: poolAddress, tokens: assets });
}

const borrowed = async (api) => {
  const debtCalls = assets.map((asset) => ({ target: poolAddress, params: [poolId, asset] }));
  const debtsRes = await multiCall({ calls: debtCalls, abi: abi.asset_config_unsafe, allAbi });
  const decimals = await multiCall({ calls: assets, abi: abi.decimals });
  return debtsRes.forEach((res, index) => {
    const { total_nominal_debt } = res['0']
    const adjustDebt = Number(total_nominal_debt) * 10 ** (Number(decimals[index]) - 18)
    api.add(assets[index], adjustDebt);
  });
};

module.exports = {
  starknet: {
    tvl,
    borrowed,
  },
};

