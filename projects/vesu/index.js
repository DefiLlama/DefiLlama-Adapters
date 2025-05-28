const ADDRESSES = require('../helper/coreAssets.json')
const { multiCall, sumTokens } = require("../helper/chain/starknet");
const { abi, allAbi } = require("./abi");

const INTERNAL_SCALE = 10 ** 18;
const SINGLETON = "0x02545b2e5d519fc230e9cd781046d3a64e092114f07e44771e0d719d148725ef";
const POOLS = [
  "0x4dc4f0ca6ea4961e4c8373265bfd5317678f4fe374d76f3fd7135f57763bf28", //  Genesis Pool
  "0x7f135b4df21183991e9ff88380c2686dd8634fd4b09bb2b5b14415ac006fe1d", // Re7 USDC Pool
  "0x52fb52363939c3aa848f8f4ac28f0a51379f8d1b971d8444de25fbd77d8f161", // Re7 xSTRK Pool
  "0x2e06b705191dbe90a3fbaad18bb005587548048b725116bff3104ca501673c1", // Re7 sSTRK Pool
  "0x6febb313566c48e30614ddab092856a9ab35b80f359868ca69b2649ca5d148d", // Re7 Starknet Ecosystem Pool
  "0x59ae5a41c9ae05eae8d136ad3d7dc48e5a0947c10942b00091aeb7f42efabb7", // Re7 wstETH Pool
  "0x7bafdbd2939cc3f3526c587cb0092c0d9a93b07b9ced517873f7f6bf6c65563", // Alterscope CASH Pool
  "0x27f2bb7fb0e232befc5aa865ee27ef82839d5fad3e6ec1de598d0fab438cb56", // Alterscope xSTRK Pool
  "0x5c678347b60b99b72f245399ba27900b5fc126af11f6637c04a193d508dda26", // Alterscope wstETH Pool
  "0x2906e07881acceff9e4ae4d9dacbcd4239217e5114001844529176e1f0982ec", // Alterscope Cornerstone Pool
  "0x3de03fafe6120a3d21dc77e101de62e165b2cdfe84d12540853bd962b970f99", // Re7 rUSDC Pool
];
const ASSETS = [
  ADDRESSES.starknet.ETH,
  ADDRESSES.starknet.WBTC,
  ADDRESSES.starknet.USDC,
  ADDRESSES.starknet.USDT,
  ADDRESSES.starknet.WSTETH,
  ADDRESSES.starknet.WSTETH_1,
  ADDRESSES.starknet.STRK,
  ADDRESSES.starknet.XSTRK,
  ADDRESSES.starknet.SSTRK,
  ADDRESSES.starknet.EKUBO,
  "0x498edfaf50ca5855666a700c25dd629d577eb9afccdf3b5977aec79aee55ada", // CASH
  "0x02019e47A0Bc54ea6b4853C6123FfC8158EA3AE2Af4166928b0dE6e89f06De6C" // rUSDC
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
