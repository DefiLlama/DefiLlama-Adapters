const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");

const extractRewardTokenType = (type) => {
  const token = type
    .split(
      type.includes("::Custodian<") ? "::Custodian<" : "::FeeCollector<"
    )[1]
    .split(">")[0]
    .trim();
  return token;
};
const extractFarmTokensTypeLP = (type) => {
  if (type.includes("::LP<")) {
    const pair = type.split("::LP<")[1];
    const lpType = `${type
        .split(
          type.includes("::Custodian<") ? "::Custodian<" : "::FeeCollector<"[1]
        )[1]
        .split(">")[0]
      }>`;
    const coinXType = pair.split(",")[0]?.trim();
    const coinYType = pair.split(",")[1].split(">")[0]?.trim();
    return { coinXType, coinYType, lpType };
  } else {
    const token = extractRewardTokenType(type);
    return { coinXType: token };
  }
};

const getPool = async (listPoolFlowX, poolRegistry) => {
  let poolList = await sui.getDynamicFieldObjects({ parent: poolRegistry, cursor: null, limit: 1000000 });
  let poolInfoResult = [];
  for (let i = 0; i < poolList.length; i++) {
    let pool = poolList[i];
    let totalStaked = pool.fields.value.fields.total_token_staked;
    let poolId = pool.fields.value.fields.id.id;
    let poolInfo = await sui.call("suix_getDynamicFields", [poolId, null, 100000]);
    let { coinXType, coinYType, lpType } = extractFarmTokensTypeLP(poolInfo[0].objectType);

    let coinXStaked = 0;
    let coinYStaked = 0;
    if (lpType) {
      const flowxPoolInfo = listPoolFlowX.find((item) => item.lp_supply.type.includes(lpType));
      if (!flowxPoolInfo) continue;
      const lpRate = totalStaked / flowxPoolInfo.lp_supply.fields.value
      coinXStaked = lpRate * flowxPoolInfo.reserve_x.fields.balance
      coinYStaked = lpRate * flowxPoolInfo.reserve_y.fields.balance
    } else {
      coinXStaked = totalStaked
    }

    if (coinXType === ADDRESSES.sui.USDC) coinXStaked = coinXStaked / 1e3
    if (coinYType === ADDRESSES.sui.USDC) coinYStaked = coinYStaked / 1e3

    poolInfoResult.push({
      poolId: poolId,
      totalStaked: totalStaked,
      coinX: coinXType,
      coinY: coinYType,
      coinXStaked: coinXStaked,
      coinYStaked: coinYStaked,
    });
  }

  return poolInfoResult;
};

async function suiTVL(api) {
  const listPoolFlowX = (await sui.getDynamicFieldObjects({ parent: "0xd15e209f5a250d6055c264975fee57ec09bf9d6acdda3b5f866f76023d1563e6", sleep: 2000 }))
    .map((i) => i.fields.value.fields);
  let poolShareInfo = await getPool(listPoolFlowX, "0x3cfad71fc1f65addbadc0d4056fbd1106aa6b9a219e3ea1f5356a2f500d13182");

  //TVL on PSH Earn - ignoring pool 0, it is returning absurd value
  for (let i = 1; i < poolShareInfo.length; i++) {
    api.add(poolShareInfo[i].coinX, poolShareInfo[i].coinXStaked)

    if (poolShareInfo[i].coinY)
      api.add(poolShareInfo[i].coinY, poolShareInfo[i].coinYStaked)
  }
}

module.exports = {
  sui: {
    tvl: suiTVL,
  },
};
