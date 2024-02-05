const ADDRESSES = require("../helper/coreAssets.json");
const { default: BigNumber } = require("bignumber.js");
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
    const lpType = `${
      type
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
  let poolList = await sui.getDynamicFieldObjects({
    parent: poolRegistry,
    cursor: null,
    limit: 1000000,
  });

  let poolInfoResult = [];
  for (let i = 0; i < poolList.length; i++) {
    let pool = poolList[i];
    let totalStaked = pool.fields.value.fields.total_token_staked;
    let poolId = pool.fields.value.fields.id.id;
    let poolInfo = await sui.call("suix_getDynamicFields", [
      poolId,
      null,
      100000,
    ]);
    let { coinXType, coinYType, lpType } = extractFarmTokensTypeLP(
      poolInfo[0].objectType
    );

    let coinXStaked = new BigNumber(0);
    let coinYStaked = new BigNumber(0);
    if (lpType) {
      const flowxPoolInfo = listPoolFlowX.find((item) =>
        item.lp_supply.type.includes(lpType)
      );
      const lpRate = new BigNumber(totalStaked).div(
        flowxPoolInfo.lp_supply.fields.value
      );
      coinXStaked = lpRate.multipliedBy(flowxPoolInfo.reserve_x.fields.balance);
      coinYStaked = lpRate.multipliedBy(flowxPoolInfo.reserve_y.fields.balance);
    } else {
      coinXStaked = new BigNumber(totalStaked);
    }

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

async function suiTVL() {
  const { api } = arguments[3];
  const listPoolFlowX = (
    await sui.getDynamicFieldObjects({
      parent:
        "0xd15e209f5a250d6055c264975fee57ec09bf9d6acdda3b5f866f76023d1563e6",
    })
  ).map((i) => i.fields.value.fields);

  let poolCashInfo = await getPool(
    listPoolFlowX,
    "0xf59d382506b74d4502d3e26cff5d581af75d0869ceb57bccdbf762dc1b092153"
  );

  let poolShareInfo = await getPool(
    listPoolFlowX,
    "0x3cfad71fc1f65addbadc0d4056fbd1106aa6b9a219e3ea1f5356a2f500d13182"
  );

  let boardRoom = await sui.getObject(
    "0x35b4a18dcf3daedf4a49c38b053131bfd2321532668c5bca2924c27337f17111"
  );

  let totalResult = {};

  //TVL on boardroom
  totalResult[
    "0x3c1227010835ecf9cb8f2bf9993aa9378bb951f0b3a098de6f0ee20385e01c4a::psh::PSH"
  ] = new BigNumber(boardRoom.fields.total_staked);

  //TVL on PDO Earn
  for (let i = 0; i < poolCashInfo.length; i++) {
    if (!totalResult.hasOwnProperty(poolCashInfo[i].coinX)) {
      totalResult[poolCashInfo[i].coinX] = poolCashInfo[i].coinXStaked;
    } else {
      totalResult[poolCashInfo[i].coinX] = totalResult[
        poolCashInfo[i].coinX
      ].plus(poolCashInfo[i].coinXStaked);
    }

    if (poolCashInfo[i].coinY) {
      if (!totalResult.hasOwnProperty(poolCashInfo[i].coinY)) {
        totalResult[poolCashInfo[i].coinY] = poolCashInfo[i].coinYStaked;
      } else {
        totalResult[poolCashInfo[i].coinY] = totalResult[
          poolCashInfo[i].coinY
        ].plus(poolCashInfo[i].coinYStaked);
      }
    }
  }

  //TVL on PSH Earn
  for (let i = 0; i < poolShareInfo.length; i++) {
    if (!totalResult.hasOwnProperty(poolShareInfo[i].coinX)) {
      totalResult[poolShareInfo[i].coinX] = poolShareInfo[i].coinXStaked;
    } else {
      totalResult[poolShareInfo[i].coinX] = totalResult[
        poolShareInfo[i].coinX
      ].plus(poolShareInfo[i].coinXStaked);
    }

    if (poolShareInfo[i].coinY) {
      if (!totalResult.hasOwnProperty(poolShareInfo[i].coinY)) {
        totalResult[poolShareInfo[i].coinY] = poolShareInfo[i].coinYStaked;
      } else {
        totalResult[poolShareInfo[i].coinY] = totalResult[
          poolShareInfo[i].coinY
        ].plus(poolShareInfo[i].coinYStaked);
      }
    }
  }

  //Result
  for (const property in totalResult) {
    if (property) {
      api.add(property, totalResult[property].toFixed(0));
    }
  }
}

module.exports = {
  sui: {
    tvl: suiTVL,
  },
};
