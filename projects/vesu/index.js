const ADDRESSES = require('../helper/coreAssets.json')
const { multiCall, sumTokens, getLogs, parseAddress } = require("../helper/chain/starknet");
const { getSelectorFromName } = require("../helper/utils/starknet");
const { erc20ABI, singletonABI, poolABI } = require("./abi");

const INTERNAL_SCALE = 10 ** 18;
const SINGLETON = "0x000d8d6dfec4d33bfb6895de9f3852143a17c6f92fd2a21da3d6924d34870160";
const SINGLETON_POOLS = [
  "0x4dc4f0ca6ea4961e4c8373265bfd5317678f4fe374d76f3fd7135f57763bf28", // Vesu Genesis Pool
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
// V2 pools are deployed by the pool factory, which emits AddAsset(pool, asset) for every asset it lists in a pool
// https://github.com/vesuxyz/vesu-v2/blob/main/deployment.json
const V2_POOL_FACTORY = { target: "0x3760f903a37948f97302736f89ce30290e45f441559325026842b7a6fb388c0", fromBlock: 2367000 };
const ADD_ASSET = getSelectorFromName("AddAsset");

// each (pool, asset) pair is kept once
async function getV2PoolAssets() {
  const logs = await getLogs({ ...V2_POOL_FACTORY, topics: [ADD_ASSET] });
  const pairs = new Map();
  logs.forEach(({ keys }) => {
    const pool = parseAddress(keys[1]);
    const asset = parseAddress(keys[2]);
    pairs.set(`${pool}-${asset}`, { pool, asset });
  });
  return [...pairs.values()];
}

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
  "0x02019e47A0Bc54ea6b4853C6123FfC8158EA3AE2Af4166928b0dE6e89f06De6C", // rUSDC,
  "0x0593e034dda23eea82d2ba9a30960ed42cf4a01502cc2351dc9b9881f9931a68", // solvBTC
  ADDRESSES.starknet.tBTC, // tBTC
  "0x036834a40984312f7f7de8d31e3f6305b325389eaeea5b1c0664b2fb936461a4", // lBTC
  "0x023a312ece4a275e38c9fc169e3be7b5613a0cb55fe1bece4422b09a88434573", // uniBTC
  "0x6a567e68c805323525fe1649adb80b03cddf92c23d2629a6779f54192dffc13", // wWBTC
  "0x580f3dc564a7b82f21d40d404b3842d490ae7205e6ac07b1b7af2b4a5183dc9", // xSBTC
  "0x43a35c1425a0125ef8c171f1a75c6f31ef8648edcc8324b55ce1917db3f9b91", // xTBTC
  "0x7dd3c80de9fcc5545f0cb83678826819c79619ed7992cc06ff81fc67cd2efe0", // xLBTC
  "0x04be8945e61dc3e19ebadd1579a6bd53b262f51ba89e6f8b0c4bc9a7e3c633fc", // mRE7Yield
  ADDRESSES.starknet.USDC_CIRCLE, // USDC (Native)
];

async function tvl(api) {
  const poolAssetsV2 = await getV2PoolAssets();
  await sumTokens({ api, owner: SINGLETON, tokens: ASSETS });
  return sumTokens({ api, tokensAndOwners: poolAssetsV2.map(({ pool, asset }) => [asset, pool]) });
}

const borrowed = async (api) => {
  // V1 Pools
  const poolAssets = SINGLETON_POOLS.map((pool_id) => ASSETS.map((asset) => ({ pool_id, asset }))).flat();
  const calls = poolAssets.map(({ pool_id, asset }) => ({ target: SINGLETON, params: [pool_id, asset] }))
  const assetStates = await multiCall({ calls, abi: singletonABI[0], allAbi: singletonABI });
  assetStates.forEach((res, index) => {
    const { total_nominal_debt, scale, last_rate_accumulator } = res['0'];
    const totalDebt = Number(total_nominal_debt) * Number(last_rate_accumulator) / INTERNAL_SCALE;
    const scaledTotalDebt = totalDebt * Number(scale) / INTERNAL_SCALE;
    api.add(poolAssets[index].asset, scaledTotalDebt);
  });
  // V2 Pools
  const poolAssetsV2 = await getV2PoolAssets();
  const callsV2 = poolAssetsV2.map(({ pool, asset }) => ({ target: pool, params: [asset] }))
  const assetStatesV2 = await multiCall({ calls: callsV2, abi: poolABI[0], allAbi: poolABI, permitFailure: true });
  assetStatesV2.forEach((res, index) => {
    if (res === null) return;
    const { total_nominal_debt, scale, last_rate_accumulator } = res;
    const totalDebt = Number(total_nominal_debt) * Number(last_rate_accumulator) / INTERNAL_SCALE;
    const scaledTotalDebt = totalDebt * Number(scale) / INTERNAL_SCALE;
    api.add(poolAssetsV2[index].asset, scaledTotalDebt);
  });
};

module.exports = {
  timetravel: false, // the starknet helper calls always read the latest block
  starknet: {
    tvl,
    borrowed,
  },
};
