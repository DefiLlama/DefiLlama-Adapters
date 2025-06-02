const ADDRESSES = require('../helper/coreAssets.json')
const { default: BigNumber } = require("bignumber.js");
const sui = require("../helper/chain/sui");

async function suiTVL(api) {

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
        setPropertyPriceMap(totalResult, property, result[property]);
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
        setPropertyPriceMap(totalResult, property, result[property]);
      }
    }
  }

  //get faas flowx lock
  const strategyDynamicFields = await sui.getDynamicFieldObjects({
    parent:
      "0x25e1b7b9fc1b72d4911516574e720bea5920bed2973df5eabdb4af0af8d09c8e",
  });

  const lpMapSupply = {};
  for (const strategy of strategyDynamicFields) {
    const lpDataType = strategy.fields.value.type
      .split("<")[1]
      .split(",")
      .slice(0, 2);
    lpMapSupply[lpDataType.join(",")] =
      strategy.fields.value.fields.vault.fields.position.fields.amount;
  }

  for (const flowxFaaSType in lpMapSupply) {
    let result = flowxFaaSTVL(
      listPoolFlowX,
      flowxFaaSType,
      lpMapSupply[flowxFaaSType]
    );
    for (const property in result) {
      setPropertyPriceMap(totalResult, property, result[property]);
    }
  }

  //get scallop lock

  let scallopPool = await sui.getObject(
    "0xfe07bedaf312f86ed1fd38ca9eef213c6bb1236282bd2c7c72720231b0a676ca"
  );

  setPropertyPriceMap(
    totalResult,
    ADDRESSES.sui.SUI,
    new BigNumber(scallopPool.fields.total_tvl)
  );

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

const flowxFaaSTVL = (listPoolFlowX, flowFaaSType, staked) => {
  const flowxPoolInfo = listPoolFlowX.find((item) =>
    item.lp_supply.type.includes(flowFaaSType)
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

const setPropertyPriceMap = (totalResult, property, value) => {
  if (totalResult[property]) {
    totalResult[property] = totalResult[property].plus(value);
  } else {
    totalResult[property] = value;
  }
};

module.exports = {
  sui: {
    tvl: suiTVL,
  },
};
