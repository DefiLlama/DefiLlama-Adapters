const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");

const MAINNET_PROTOCOL_ID =
  "0x9e3dab13212b27f5434416939db5dec6a319d15b89a84fd074d03ece6350d3df";
const BUCK =
  "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK";
const USDC =
  ADDRESSES.sui.USDC;
const USDT =
  ADDRESSES.sui.USDT;

const AF_LP_IDs = [
  "0xe2569ee20149c2909f0f6527c210bc9d97047fe948d34737de5420fab2db7062",
  "0x885e09419b395fcf5c8ee5e2b7c77e23b590e58ef3d61260b6b4eb44bbcc8c62",
];

const AF_POOL_IDs = [
  "0xdeacf7ab460385d4bcb567f183f916367f7d43666a2c72323013822eb3c57026",
  "0xeec6b5fb1ddbbe2eb1bdcd185a75a8e67f52a5295704dd73f3e447394775402b",
];

const KRIYA_LP_IDS = [
  "0xcc39bcc2c438a79beb2656ff043714a60baf89ba37592bef2e14ee8bca0cf007",
  "0xae1910e5bcb13a4f5b12688f0da939b9c9d3e8a9e8d0a2e02c818f6a94e598fd",
];

const KRIYA_POOL_IDs = [
  "0x3c334f9d1b969767007d26bc886786f9f197ffb14771f7903cd8772c46d08dea",
  "0xbb4a712b3353176092cdfe3dd2d1251b725f9372e954248e5dd2eb2ab6a5f21a",
];

const CETUS_LP_ID =
  "0xb9d46d57d933fabaf9c81f4fc6f54f9c1570d3ef49785c6b7200cad6fe302909";

const USDC_PSM =
  "0x0c2e5fbfeb5caa4c2f7c8645ffe9eca7e3c783536efef859be03146b235f9e04";

const USDT_PSM =
  "0x607e7d386e29066b964934e0eb1daa084538a79b5707c34f38e190d64e24923e";

const BUCKETUS_PSM =
  "0xba86a0f37377844f38060a9f62b5c5cd3f8ba13901fa6c4ee5777c1cc535306b";

async function tvl(_, _1, _2, { api }) {
  const protocolFields = await sui.getDynamicFieldObjects({
    parent: MAINNET_PROTOCOL_ID,
  });

  const aflpObjs = await sui.getObjects(AF_LP_IDs);
  const aflStakedList = aflpObjs.map((aflp) => aflp.fields.staked);
  const buckAfPoolData = await sui.getObjects(AF_POOL_IDs);

  const kriyalpObjs = await sui.getObjects(KRIYA_LP_IDS);
  const kriyaStakedList = kriyalpObjs.map(
    (kriyalp) => kriyalp.fields.staked.fields.lsp.fields.balance
  );
  const kriyalpPoolData = await sui.getObjects(KRIYA_POOL_IDs);

  const cetusLpObj = await sui.getObject(CETUS_LP_ID);
  const stakedBucketus = cetusLpObj.fields.staked;

  const usdcPSMObj = await sui.getObject(USDC_PSM);
  const usdcPSMAmount = usdcPSMObj.fields.pool;

  const usdtPSMObj = await sui.getObject(USDT_PSM);
  const usdtPSMAmount = usdtPSMObj.fields.pool;

  const bucketusPSMObj = await sui.getObject(BUCKETUS_PSM);
  const bucketusPSMAmount = bucketusPSMObj.fields.pool;

  const bucketList = protocolFields.filter((item) =>
    item.type.includes("Bucket")
  );

  const tankList = protocolFields.filter((item) => item.type.includes("Tank"));

  for (const bucket of bucketList) {
    const coin = bucket.type.split("<").pop()?.replace(">", "") ?? "";
    api.add(coin, bucket.fields.collateral_vault);
  }

  /* for (const tank of tankList) {
    api.add(BUCK, tank.fields.reserve);
  } */

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
  ] of buckAfPoolData.entries()) {
    bals.forEach((v, i) => {
      const value = Math.floor(
        (v * aflStakedList[index]) / lp_supply.fields.value / decimal_scalars[i]
      );

      const token = "0x" + tokens[i];
      if (token !== BUCK) api.add(token, value);
    });
  }

  for (const [
    index,
    {
      type,
      fields: { lsp_supply, token_x, token_y },
    },
  ] of kriyalpPoolData.entries()) {
    const tokens = type.split("<").pop()?.replace(">", "")?.split(",") ?? [];
    const x = tokens[0].trim();
    const y = tokens[1].trim();

    const xVal = Math.floor(
      (token_x * kriyaStakedList[index]) / lsp_supply.fields.value
    );
    const yVal = Math.floor(
      (token_y * kriyaStakedList[index]) / lsp_supply.fields.value
    );

    if (x !== BUCK) api.add(x, xVal);
    if (y !== BUCK) api.add(y, yVal);
  }

  // Cetus USDC-BUCK LP
  // 1 Bucketus = 0.5 BUCK + 0.5 USDC
  const halfStakedBucketus = Math.floor(stakedBucketus / 2);
  // api.add(BUCK, halfStakedBucketus);
  api.add(USDC, Math.floor(halfStakedBucketus / 1000));

  api.add(USDC, Math.floor(usdcPSMAmount));
  api.add(USDT, Math.floor(usdtPSMAmount));

  const halfBucketusAmount = Math.floor(bucketusPSMAmount / 2);
  // api.add(BUCK, halfBucketusAmount);
  api.add(USDC, Math.floor(halfBucketusAmount / 1000));
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
