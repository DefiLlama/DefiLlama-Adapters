const sui = require("../helper/chain/sui");

const MAINNET_PROTOCOL_ID =
  "0x9e3dab13212b27f5434416939db5dec6a319d15b89a84fd074d03ece6350d3df";
const BUCK =
  "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK";

const AF_LP_IDs = [
  "0xe2569ee20149c2909f0f6527c210bc9d97047fe948d34737de5420fab2db7062",
  "0x885e09419b395fcf5c8ee5e2b7c77e23b590e58ef3d61260b6b4eb44bbcc8c62",
];

const AF_POOL_IDs = [
  "0xdeacf7ab460385d4bcb567f183f916367f7d43666a2c72323013822eb3c57026",
  "0xeec6b5fb1ddbbe2eb1bdcd185a75a8e67f52a5295704dd73f3e447394775402b",
];

async function tvl(_, _1, _2, { api }) {
  const protocolFields = await sui.getDynamicFieldObjects({
    parent: MAINNET_PROTOCOL_ID,
  });

  const aflpObjs = await sui.getObjects(AF_LP_IDs);

  const stakedList = aflpObjs.map((aflp) => aflp.fields.staked);

  const pools = await sui.queryEvents({
    eventType:
      "0xefe170ec0be4d762196bedecd7a065816576198a6527c99282a2551aaa7da38c::events::CreatedPoolEvent",
    transform: (i) => i.pool_id,
  });
  const poolData = await sui.getObjects(pools);
  const buckPoolData = AF_POOL_IDs.map((id) =>
    poolData.find((pool) => pool.fields.id.id === id)
  );

  const bucketList = protocolFields.filter((item) =>
    item.type.includes("Bucket")
  );

  const tankList = protocolFields.filter((item) => item.type.includes("Tank"));

  for (const bucket of bucketList) {
    const coin = bucket.type.split("<").pop()?.replace(">", "") ?? "";
    api.add(coin, bucket.fields.collateral_vault);
  }

  for (const tank of tankList) {
    api.add(BUCK, tank.fields.reserve);
  }

  for (const [
    index,
    {
      fields: {
        type_names: tokens,
        normalized_balances: bals,
        lp_supply,
        decimal_scalars,
      },
    },
  ] of buckPoolData.entries()) {
    bals.forEach((v, i) => {
      const value = Math.floor(
        (v * stakedList[index]) / lp_supply.fields.value / decimal_scalars[i]
      );
      api.add("0x" + tokens[i], value);
    });
  }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
