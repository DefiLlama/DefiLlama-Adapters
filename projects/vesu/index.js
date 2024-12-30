const ADDRESSES = require('../helper/coreAssets.json')
const { multiCall, sumTokens } = require("../helper/chain/starknet");
const { abi, allAbi } = require("./abi");

const INTERNAL_SCALE = 10 ** 18;
const SINGLETON = "0x02545b2e5d519fc230e9cd781046d3a64e092114f07e44771e0d719d148725ef";
const POOLS = [
  "0x4dc4f0ca6ea4961e4c8373265bfd5317678f4fe374d76f3fd7135f57763bf28", //  Genesis Pool
  "0x7f135b4df21183991e9ff88380c2686dd8634fd4b09bb2b5b14415ac006fe1d", // Re7 USDC Pool
  "0x52fb52363939c3aa848f8f4ac28f0a51379f8d1b971d8444de25fbd77d8f161", // Re7 xSTRK Pool
  "0x2e06b705191dbe90a3fbaad18bb005587548048b725116bff3104ca501673c1" // Re7 sSTRK Pool
];
const ASSETS = [
  ADDRESSES.starknet.ETH,
  ADDRESSES.starknet.WBTC,
  ADDRESSES.starknet.USDC,
  ADDRESSES.starknet.USDT,
  ADDRESSES.starknet.WSTETH,
  ADDRESSES.starknet.STRK,
  ADDRESSES.starknet.XSTRK,
  ADDRESSES.starknet.SSTRK
];

async function tvl(api) {
  return sumTokens({ api, owner: SINGLETON, tokens: ASSETS });
}

const borrowed = async (api) => {
  const poolAssets = POOLS.map((pool_id) => ASSETS.map((asset) => ({ pool_id, asset }))).flat();
  const calls = poolAssets.map(({ pool_id, asset }) => ({ target: SINGLETON, params: [pool_id, asset] }))
  const assetStates = await multiCall({ calls, abi: abi.asset_config_unsafe, allAbi });
  assetStates.forEach((res, index) => {
    const { total_nominal_debt, scale, last_rate_accumulator } = res['0']
    const totalDebt = Number(total_nominal_debt) * Number(last_rate_accumulator) / INTERNAL_SCALE;
    const scaledTotalDebt = totalDebt * Number(scale) / INTERNAL_SCALE;
    api.add(poolAssets[index].asset, scaledTotalDebt);
  });
};

module.exports = {
  starknet: {
    tvl,
    borrowed,
  },
};
