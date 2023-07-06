const sui = require("../helper/chain/sui");

const MAINNET_PROTOCOL_ID =
  "0x9e3dab13212b27f5434416939db5dec6a319d15b89a84fd074d03ece6350d3df";

async function tvl(_, _1, _2, { api }) {
  const protocolFields = await sui.getDynamicFieldObjects({
    parent: MAINNET_PROTOCOL_ID,
  });

  const bucketList = protocolFields.filter((item) =>
    item.type.includes("Bucket")
  );

  for (const bucket of bucketList) {
    const coin = bucket.type.split("<").pop()?.replace(">", "") ?? "";
    api.add(coin, bucket.fields.collateral_vault);
  }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
