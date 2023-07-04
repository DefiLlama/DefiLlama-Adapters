const sui = require("../helper/chain/sui");

const MAINNET_PROTOCOL_ID =
  "0x9e3dab13212b27f5434416939db5dec6a319d15b89a84fd074d03ece6350d3df";
const BUCK =
  "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK";

async function tvl(_, _1, _2, { api }) {
  const protocolFields = await sui.getDynamicFieldObjects({
    parent: MAINNET_PROTOCOL_ID,
  });

  const bucketList = protocolFields.filter((item) =>
    item.type.includes("Bucket")
  );

  const tankList = protocolFields.filter((item) => item.type.includes("Tank"));

  for (const bucket of bucketList) {
    const coin = bucket.type.split("<").pop()?.replace(">", "") ?? "";
    api.add(coin, bucket.fields.collateral_vault);
  }

  for (const tank of tankList) {
    api.add(BUCK, tank.fields.reserve / 1e9);
  }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
