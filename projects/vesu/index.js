const ADDRESSES = require('../helper/coreAssets.json')
const { multiCall, sumTokens } = require("../helper/chain/starknet");
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
const V2_POOLS = [
  "0x451fe483d5921a2919ddd81d0de6696669bccdacd859f72a4fba7656b97c3b5", // Vesu Prime Pool
  "0x2eef0c13b10b487ea5916b54c0a7f98ec43fb3048f60fdeedaf5b08f6f88aaf", // Re7 USDC Prime Pool
  "0x3976cac265a12609934089004df458ea29c776d77da423c96dc761d09d24124", // Re7 USDC Core Pool
  "0x3a8416bf20d036df5b1cf3447630a2e1cb04685f6b0c3a70ed7fb1473548ecf", // Re7 xBTC Pool
  "0x73702fce24aba36da1eac539bd4bae62d4d6a76747b7cdd3e016da754d7a135", // Re7 USDC Stable Core Pool
  "0x5c03e7e0ccfe79c634782388eb1e6ed4e8e2a013ab0fcc055140805e46261bd", // Re7 USDC Frontier Pool
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
  "0x02019e47A0Bc54ea6b4853C6123FfC8158EA3AE2Af4166928b0dE6e89f06De6C", // rUSDC,
  "0x0593e034dda23eea82d2ba9a30960ed42cf4a01502cc2351dc9b9881f9931a68", // solvBTC
  "0x04daa17763b286d1e59b97c283c0b8c949994c361e426a28f743c67bdfe9a32f", // tBTC
  "0x036834a40984312f7f7de8d31e3f6305b325389eaeea5b1c0664b2fb936461a4", // lBTC
  "0x023a312ece4a275e38c9fc169e3be7b5613a0cb55fe1bece4422b09a88434573", // uniBTC
  "0x6a567e68c805323525fe1649adb80b03cddf92c23d2629a6779f54192dffc13", // wWBTC
  "0x580f3dc564a7b82f21d40d404b3842d490ae7205e6ac07b1b7af2b4a5183dc9", // xSBTC
  "0x43a35c1425a0125ef8c171f1a75c6f31ef8648edcc8324b55ce1917db3f9b91", // xTBTC
  "0x7dd3c80de9fcc5545f0cb83678826819c79619ed7992cc06ff81fc67cd2efe0", // xLBTC
  "0x04be8945e61dc3e19ebadd1579a6bd53b262f51ba89e6f8b0c4bc9a7e3c633fc" // mRE7Yield
];

async function tvl(api) {
  return sumTokens({ api, owners: [SINGLETON, ...V2_POOLS], tokens: ASSETS });
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
  const poolAssetsV2 = V2_POOLS.map((pool) => ASSETS.map((asset) => ({ pool, asset }))).flat();
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
  starknet: {
    tvl,
    borrowed,
  },
};
