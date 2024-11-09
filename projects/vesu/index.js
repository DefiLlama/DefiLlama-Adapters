const ADDRESSES = require('../helper/coreAssets.json')
const { multiCall, sumTokens } = require("../helper/chain/starknet");
const { abi, allAbi } = require("./abi");

const INTERNAL_SCALE = 10 ** 18;
const SINGLETON = "0x02545b2e5d519fc230e9cd781046d3a64e092114f07e44771e0d719d148725ef";
const POOL_ID = "0x4dc4f0ca6ea4961e4c8373265bfd5317678f4fe374d76f3fd7135f57763bf28";
const ASSETS = [
  ADDRESSES.starknet.ETH,
  ADDRESSES.starknet.WBTC,
  ADDRESSES.starknet.USDC,
  ADDRESSES.starknet.USDT,
  ADDRESSES.starknet.WSTETH,
  ADDRESSES.starknet.STRK,
];

async function tvl(api) {
  return sumTokens({ api, owner: SINGLETON, tokens: ASSETS });
}

const borrowed = async (api) => {
  const calls = ASSETS.map((asset) => ({ target: SINGLETON, params: [POOL_ID, asset] }));
  const assetStates = await multiCall({ calls, abi: abi.asset_config_unsafe, allAbi });
  return assetStates.forEach((res, index) => {
    const { total_nominal_debt, scale, last_rate_accumulator } = res['0']
    const totalDebt = Number(total_nominal_debt) * Number(last_rate_accumulator) / INTERNAL_SCALE;
    const scaledTotalDebt = totalDebt * Number(scale) / INTERNAL_SCALE;
    api.add(ASSETS[index], scaledTotalDebt);
  });
};

module.exports = {
  starknet: {
    tvl,
    borrowed,
  },
};
