const ADDRESSES = require('../helper/coreAssets.json')
const { getResources, getTableData } = require("../helper/chain/aptos");

const extractCoinAddress = (str) =>
  str.slice(str.indexOf("<") + 1, str.lastIndexOf(">"));

const APT = ADDRESSES.aptos.APT;

const ALT =
  "0xd0b4efb4be7c3508d9a26a9b5405cf9f860d0b9e5fe2f498b90e68b8d2cedd3e::aptos_launch_token::AptosLaunchToken";

const MOVE =
  "0xd0b4efb4be7c3508d9a26a9b5405cf9f860d0b9e5fe2f498b90e68b8d2cedd3e::move_ecosystem_fund::MoveEcosystemFund";

const lzUSDT =
  ADDRESSES.aptos.USDT_2;
const lzUSDC =
  ADDRESSES.aptos.USDC_2;

const MOVE_APT_LP =
  "0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::swap::LPToken<0x1::aptos_coin::AptosCoin, 0xd0b4efb4be7c3508d9a26a9b5405cf9f860d0b9e5fe2f498b90e68b8d2cedd3e::move_ecosystem_fund::MoveEcosystemFund>";
const MOVE_USDT_LP =
  "0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::swap::LPToken<0xd0b4efb4be7c3508d9a26a9b5405cf9f860d0b9e5fe2f498b90e68b8d2cedd3e::move_ecosystem_fund::MoveEcosystemFund, 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT>";

const SLT =
  "0x8b2df69c9766e18486c37e3cfc53c6ce6e9aa58bbc606a8a0a219f24cf9eafc1::sui_launch_token::SuiLaunchToken";

const altLockBond = async (api) => {
  let pools = [
    "0xb9c61f47e66ca6f718eb54f4c602dc4b47635311737e2735fa4e2fc70d91ad1b", // 3m pool
    "0xd754841a8ec527e45b5ba13cf36ecd352210c181ed17662e4b05c879574cabd9", // 6m pool
    "0x3eeb87a51d96c33b476c1af60509f025eb124e3e0b0ce5b1607a4a1ee6618c2a", // 9m pool
    "0xaecc70624949829163d4e37e484c913a36f79df2ed8d1d249d74532a99b3d3b7", // 12m pool
    "0x4896772e9d8059283ca16025697541df6cb895308bdd7f260f3404ed3513af12", // altslt pool
  ];
  let poolResources = [];

  (await Promise.all(pools.map(async (i) => await getResources(i)))).forEach(
    (e) => poolResources.push(...e)
  );

  poolResources
    .filter((i) => i.type.includes("PoolInfo"))
    .map((e) => api.add(ALT,
      e.data.total_bond_in_amount -
      e.data.distributed_reward /
      (e.data.conversion_rate / e.data.conversion_precision) /
      (e.data.bonus_rate / e.data.bonus_precision)))
};

const cakeLPsltStaking = async (api) => {
  let resources = await getResources(
    "0xd156fba6722a47b79c0884ed13b03ba5238e47b94ead837d5fba045feae4a4f9"
  );

  resources
    .filter((i) => i.type.includes("0x1::coin::CoinStore"))
    .map((i) => api.add(extractCoinAddress(i.type), i.data.coin.value));

};

const moveStaking = async (api) => {
  let resources = await getResources(
    "0x15ff26488572ac5183e27dad6cae1cfd36d2e82350fd85f58a85537279e0c3d"
  );

  let stakeInfo = resources.find(
    (r) =>
      r.type ===
      "0xc2551e38e8d2aaf71b6f8b69458e6ebe5d649d4014fb90e546c95a394ca1f2f7::move_staking_v1::PoolInfo"
  );

  api.add(MOVE, stakeInfo.data.amount)
};

const getCoinInfo = async (coinType) => {
  let coinResources = await getTableData({
    table: "0x234385765b658d074b82549cbd830e7bfc5c210f3e11a46998c2bed5e6429697",
    data: {
      key: coinType,
      key_type: "0x1::string::String",
      value_type:
        "0xc2551e38e8d2aaf71b6f8b69458e6ebe5d649d4014fb90e546c95a394ca1f2f7::move_ibo_bond::AcceptCoinInfo",
    },
  });
  return coinResources.total_amount;
};

const moveIbo = async (api, tvlType) => {
  let resources = await getResources(
    "0xffc234602dfd2f44613a886d293775c8de5400f91a5d3d554a037125544e1aae"
  );

  let iboInfo = resources.find(
    (r) => r.type === `0x1::coin::CoinStore<${MOVE}>`
  );

  const acceptCoinArr = [];

  switch (tvlType) {
    case 'tvl':
      acceptCoinArr.push(APT, lzUSDC, lzUSDT,);
      break;
    case 'pool2':
      acceptCoinArr.push(MOVE_APT_LP, MOVE_USDT_LP);
      break;
    case 'staking':
      acceptCoinArr.push(ALT);
      break;
    default:
      break;
  }

  let bals = await Promise.all(acceptCoinArr.map(getCoinInfo));
  if (tvlType === 'staking')
    api.add(MOVE, iboInfo.data.coin.value)
  api.addTokens(acceptCoinArr, bals)
};

const tvl = async (api) => {
  await moveIbo(api, 'tvl');
  return api.getBalances()
};
const pool2 = async (api) => {
  await moveIbo(api, 'pool2');
  await cakeLPsltStaking(api);
  return api.getBalances()
};

const staking = async (api) => {
  await moveIbo(api, 'staking');
  await moveStaking(api);
  await altLockBond(api)
  return api.getBalances()
};

module.exports = {
  timetravel: false,
  methodology:
    "Counts the lamports for each coins in every pools of AptosLaunch.",
  aptos: {
    tvl, staking, pool2,
  },
};
