const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");

const MAINNET_PROTOCOL_ID =
  "0x9e3dab13212b27f5434416939db5dec6a319d15b89a84fd074d03ece6350d3df";
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

const afSUI_sLP_ID =
  "0x508da82c0b6785653f638b95ebf7c89d720ecffae15c4d0526228a2edae7d429";

const vSUI_sLP_ID =
  "0xa68124b518290f430f2133bcb679c519e51c99045e622cd6bcb00374c97f6d9d";

const haSUI_sLP_ID =
  "0xa8993bf1c1e717b7c0f164c51346fa99a4e771c50d90c14e755adc48e39b7768";

const navi_sLP_ID =
  "0xcbe804c8c334dcadecd4ba05ee10cffa54dad36f279ab4ec9661d67f9372881c";

const scallop_sUSDC_LP_ID =
  "0x7b16192d63e6fa111b0dac03f99c5ff965205455089f846804c10b10be55983c";

const scallop_sUSDT_LP_ID =
  "0x6b68b42cbb4efccd9df30466c21fff3c090279992c005c45154bd1a0d87ac725";

async function getStakingLPAmount(id) {
  const stakingLPObject = await sui.getObject(id);
  return stakingLPObject.fields.output_volume;
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
  const safSUILPAmount = await getStakingLPAmount(afSUI_sLP_ID);
  api.add(
    "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
    safSUILPAmount
  );

  const svSUILPAmount = await getStakingLPAmount(vSUI_sLP_ID);
  api.add(
    "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT",
    svSUILPAmount
  );

  const shaSUILPAmount = await getStakingLPAmount(haSUI_sLP_ID);
  api.add(
    "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI",
    shaSUILPAmount
  );

  const snaviLPAmount = await getStakingLPAmount(navi_sLP_ID);
  api.add(
    "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT",
    snaviLPAmount
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
