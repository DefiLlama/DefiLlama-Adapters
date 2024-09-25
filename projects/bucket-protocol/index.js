const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");

const MAINNET_PROTOCOL_ID =
  "0x9e3dab13212b27f5434416939db5dec6a319d15b89a84fd074d03ece6350d3df";
const SUI = ADDRESSES.sui.SUI;
const BUCK = ADDRESSES.sui.BUCK;
const USDC = ADDRESSES.sui.USDC;
const USDT = ADDRESSES.sui.USDT;

const AF_LP_IDs = [
  "0xe2569ee20149c2909f0f6527c210bc9d97047fe948d34737de5420fab2db7062",
  "0x885e09419b395fcf5c8ee5e2b7c77e23b590e58ef3d61260b6b4eb44bbcc8c62",
];

const AF_POOL_IDs = [
  "0xdeacf7ab460385d4bcb567f183f916367f7d43666a2c72323013822eb3c57026",
  "0xeec6b5fb1ddbbe2eb1bdcd185a75a8e67f52a5295704dd73f3e447394775402b",
];

const AFSUI_SUI_LP_ID =
  "0x97aae7a80abb29c9feabbe7075028550230401ffe7fb745757d3c28a30437408";
const AFSUI_SUI_LP_BUCKET_ID =
  "0x1e88892e746708ec69784a56c6aba301a97e87e5b77aaef0eec16c3e472e8653";

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

const CETABLE_PSM =
  "0x6e94fe6910747a30e52addf446f2d7e844f69bf39eced6bed03441e01fa66acd";

const STAPEARL_PSM =
  "0xccdaf635eb1c419dc5ab813cc64c728a9f5a851202769e254f348bff51f9a6dc";

const SUI_sLP_ID = "0x6e000540e96eb2cee3bb0ea437d66c283abcecd0cbb8c19127be6a8592b2c653"

const afSUI_sLP_ID = "0xf64da6342c5b35cb4c20c315a872824cd673e71b3faf5da7ebb7f9a0f07dc640"

const vSUI_sLP_ID = "0xef730fd6dd1b23e4604e8c242b8b4da9217bd3865501dd684d94a38553f45547"

const haSUI_sLP_ID = "0xf7192f2c7282ac6dc1089326ac7093d7b5445f26862eaa44c3c1535c8e3cb58e"

const wETH_sLP_ID = "0x5002ab811fc75637633657fce7118096e593e51008ec22ddd8d8e2b6bda235c6"

const scallop_sUSDC_LP_ID =
  "0x7b16192d63e6fa111b0dac03f99c5ff965205455089f846804c10b10be55983c";

const scallop_sUSDT_LP_ID =
  "0x6b68b42cbb4efccd9df30466c21fff3c090279992c005c45154bd1a0d87ac725";


async function getStakingLPAmount(id) {
  const stakingLPObject = await sui.getObject(id);
  return stakingLPObject.fields.value.fields.volume;
}

async function getScallopsLPAmount(id) {
  const stakingLPObject = await sui.getObject(id);
  return stakingLPObject.fields.coin_balance;
}

async function tvl(api) {
  const protocolFields = await sui.getDynamicFieldObjects({
    parent: MAINNET_PROTOCOL_ID,
  });

  const aflpObjs = await sui.getObjects(AF_LP_IDs);
  const aflStakedList = aflpObjs.map((aflp) => aflp.fields.staked);
  const buckAfPoolData = await sui.getObjects(AF_POOL_IDs);

  const afsuiSuiLpObj = await sui.getObject(AFSUI_SUI_LP_ID);
  const afsuiSuiTokenNames = afsuiSuiLpObj.fields.type_names;

  const afsuiSuiLpBucket = await sui.getObject(AFSUI_SUI_LP_BUCKET_ID);
  const afsuiSuiLpBucketStaked = afsuiSuiLpBucket.fields.collateral_vault;

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

  const cetablePSMObj = await sui.getObject(CETABLE_PSM);
  const cetablePSMAmount = cetablePSMObj.fields.pool;

  const stapearlPSMObj = await sui.getObject(STAPEARL_PSM);
  const stapearlPSMAmount = stapearlPSMObj.fields.pool;

  const bucketList = protocolFields.filter((item) =>
    item.type.includes("Bucket")
  );

  // const tankList = protocolFields.filter((item) => item.type.includes("Tank"));

  for (const bucket of bucketList) {
    //AF_LP doesn't have price, need to split the tokens
    if (bucket.type.includes("AF_LP")) continue;
    const coin = bucket.type.split("<").pop()?.replace(">", "") ?? "";
    api.add(coin, bucket.fields.collateral_vault);
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
  // Didn't add BUCK to avoid double counting
  const halfStakedBucketus = Math.floor(stakedBucketus / 2);
  api.add(USDC, Math.floor(halfStakedBucketus / 1000));

  api.add(USDC, Math.floor(usdcPSMAmount));
  api.add(USDT, Math.floor(usdtPSMAmount));

  // 1 Cetable = 0.5 USDC + 0.5 USDT
  const halfCetableAmount = Math.floor(cetablePSMAmount / 2);
  api.add(USDC, Math.floor(halfCetableAmount));
  api.add(USDT, Math.floor(halfCetableAmount));

  // 1 STAPEARL = 0.5 USDC + 0.5 USDT
  const halfStapearlAmount = Math.floor(stapearlPSMAmount / 2);
  api.add(USDC, Math.floor(halfStapearlAmount));
  api.add(USDT, Math.floor(halfStapearlAmount));

  const halfBucketusAmount = Math.floor(bucketusPSMAmount / 2);
  api.add(USDC, Math.floor(halfBucketusAmount / 1000));

  //AFSUI-SUI LP
  const afsuiSuiLpSupply = afsuiSuiLpObj.fields.lp_supply.fields.value;
  const afsuiSuiLpBalances = afsuiSuiLpObj.fields.normalized_balances;
  const suiTotalAmount = Math.floor(afsuiSuiLpBalances[0] / 10 ** 18);
  const afsuiTotalAmount = Math.floor(afsuiSuiLpBalances[1] / 10 ** 18);

  const suiPercentage = Math.floor(suiTotalAmount / afsuiSuiLpSupply);
  const afsuiPercentage = Math.floor(afsuiTotalAmount / afsuiSuiLpSupply);

  api.add(
    `0x${afsuiSuiTokenNames[0]}`,
    Math.floor(suiPercentage * afsuiSuiLpBucketStaked)
  );
  api.add(
    `0x${afsuiSuiTokenNames[1]}`,
    Math.floor(afsuiPercentage * afsuiSuiLpBucketStaked)
  );

  //Staking LPs
  const SUIsLPAmount = await getStakingLPAmount(SUI_sLP_ID);
  api.add(
    SUI,
    SUIsLPAmount
  );

  const afSUIsLPAmount = await getStakingLPAmount(afSUI_sLP_ID);
  api.add(
    "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
    afSUIsLPAmount
  );

  const vSUIsLPAmount = await getStakingLPAmount(vSUI_sLP_ID);
  api.add(
    "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT",
    vSUIsLPAmount
  );

  const haSUIsLPAmount = await getStakingLPAmount(haSUI_sLP_ID);
  api.add(
    "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI",
    haSUIsLPAmount
  );

  const wETHsLPAmount = await getStakingLPAmount(wETH_sLP_ID);
  api.add(
    "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN",
    wETHsLPAmount
  );

  const scallopUSDC_LPAmount = await getScallopsLPAmount(scallop_sUSDC_LP_ID);
  api.add(USDC, scallopUSDC_LPAmount);

  const scallopUSDT_LPAmount = await getScallopsLPAmount(scallop_sUSDT_LP_ID);
  api.add(USDT, scallopUSDT_LPAmount);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
