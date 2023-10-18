const { default: BigNumber } = require("bignumber.js");
const flowxFinance = require("../flowx-finance");
const sui = require("../helper/chain/sui");

async function suiTVL() {
  const { api } = arguments[3];

  //get list pool flowx
  const listPoolFlowX = (
    await sui.getDynamicFieldObjects({
      parent:
        "0xd15e209f5a250d6055c264975fee57ec09bf9d6acdda3b5f866f76023d1563e6",
    })
  ).map((i) => i.fields.value.fields);

  //get list pool after match
  const afterMathPools = await sui.queryEvents({
    eventType:
      "0xefe170ec0be4d762196bedecd7a065816576198a6527c99282a2551aaa7da38c::events::CreatedPoolEvent",
    transform: (i) => i.pool_id,
  });
  const afterMathData = await sui.getObjects(afterMathPools);

  //get list pool suipearl
  const poolDynamicField = await sui.getDynamicFieldObjects({
    parent:
      "0xa58b809407a212793628a0aa2603611a12454d766ff47c1d76487ceec74204db",
  });
  const listPoolObjectId = poolDynamicField.map((i) => i.fields.id.id);
  const listPoolStaked = poolDynamicField.map(
    (i) => i.fields.value.fields.total_token_staked
  );

  const poolDynamicType = (await sui.getObjects(listPoolObjectId)).map(
    (i) => i.fields.value.fields.id.id
  );

  const listType = [];
  for (const poolIndex in poolDynamicType) {
    let poolInfo = await sui.getDynamicFieldObjects({
      parent: poolDynamicType[poolIndex],
    });
    listType.push({
      type: poolInfo.find((item) => item.type.includes("CustodianDfKey")).fields
        .value.type,
      staked: listPoolStaked[poolIndex],
    });
  }

  let totalResult = {};
  for (const suiPearlLpType of listType) {
    if (suiPearlLpType.type.includes("::af_lp::AF_LP")) {
      let result = afterMathTVL(
        afterMathData,
        suiPearlLpType.type,
        suiPearlLpType.staked
      );
      for (const property in result) {
        if (totalResult[property]) {
          totalResult[property] = totalResult[property].plus(result[property]);
        } else {
          totalResult[property] = result[property];
        }
      }
    } else if (
      suiPearlLpType.type.includes(
        "0xba153169476e8c3114962261d1edc70de5ad9781b83cc617ecc8c1923191cae0::pair::LP"
      )
    ) {
      let result = flowxTVL(
        listPoolFlowX,
        suiPearlLpType.type,
        suiPearlLpType.staked
      );

      for (const property in result) {
        if (totalResult[property]) {
          totalResult[property] = totalResult[property].plus(result[property]);
        } else {
          totalResult[property] = result[property];
        }
      }
    }
  }

  for (const property in totalResult) {
    api.add(property, totalResult[property].toFixed(0));
  }
}

const afterMathTVL = (listPoolAftermath, suiPearlLpType, staked) => {
  const coinMap = {};

  const afterMathPoolInfo = listPoolAftermath.find((item) =>
    item.fields.lp_supply.type.includes(
      suiPearlLpType
        .replace(
          "0xf794e590fb6a42aee87837631e6ff9c006397503d64a1d3f69bfb3938a118b9e::custodian::Custodian<",
          ""
        )
        .replace(">", "")
    )
  );

  const lpRate = new BigNumber(staked).div(
    afterMathPoolInfo.fields.lp_supply.fields.value
  );

  for (const tokenTypeIndex in afterMathPoolInfo.fields.type_names) {
    coinMap["0x" + afterMathPoolInfo.fields.type_names[tokenTypeIndex]] = lpRate
      .multipliedBy(
        afterMathPoolInfo.fields.normalized_balances[tokenTypeIndex]
      )
      .dividedBy(afterMathPoolInfo.fields.decimal_scalars[tokenTypeIndex]);
  }

  return coinMap;
};

const flowxTVL = (listPoolFlowX, suiPearlLpType, staked) => {
  const flowxPoolInfo = listPoolFlowX.find((item) =>
    item.lp_supply.type.includes(
      suiPearlLpType
        .replace(
          "0xf794e590fb6a42aee87837631e6ff9c006397503d64a1d3f69bfb3938a118b9e::custodian::Custodian<",
          ""
        )
        .replace(">>", "")
    )
  );

  const lpRate = new BigNumber(staked).div(
    flowxPoolInfo.lp_supply.fields.value
  );
  const amountX = lpRate.multipliedBy(flowxPoolInfo.reserve_x.fields.balance);

  const amountY = lpRate.multipliedBy(flowxPoolInfo.reserve_y.fields.balance);

  const coinX = flowxPoolInfo.reserve_x.type
    .replace("0x2::coin::Coin<", "")
    .replace(">", "");

  const coinY = flowxPoolInfo.reserve_y.type
    .replace("0x2::coin::Coin<", "")
    .replace(">", "");

  const coinMap = {};
  coinMap[coinX] = amountX;
  coinMap[coinY] = amountY;
  return coinMap;
};

module.exports = {
  sui: {
    tvl: suiTVL,
  },
};
