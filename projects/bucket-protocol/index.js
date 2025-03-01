const ADDRESSES = require("../helper/coreAssets.json");
const sui = require("../helper/chain/sui");
const BigNumber = require("bignumber.js");
const { BN } = require("bn.js");
const { getObject } = require("../helper/chain/sui");

function signedShiftLeft(n0, shiftBy, bitWidth) {
  const twosN0 = n0.toTwos(bitWidth).shln(shiftBy);
  twosN0.imaskn(bitWidth + 1);
  return twosN0.fromTwos(bitWidth);
}

function signedShiftRight(n0, shiftBy, bitWidth) {
  const twoN0 = n0.toTwos(bitWidth).shrn(shiftBy);
  twoN0.imaskn(bitWidth - shiftBy + 1);
  return twoN0.fromTwos(bitWidth - shiftBy);
}

function tickIndexToSqrtPricePositive(tick) {
  let ratio;

  if ((tick & 1) !== 0) {
    ratio = new BN("79232123823359799118286999567");
  } else {
    ratio = new BN("79228162514264337593543950336");
  }

  if ((tick & 2) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79236085330515764027303304731")),
      96,
      256,
    );
  }
  if ((tick & 4) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79244008939048815603706035061")),
      96,
      256,
    );
  }
  if ((tick & 8) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79259858533276714757314932305")),
      96,
      256,
    );
  }
  if ((tick & 16) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79291567232598584799939703904")),
      96,
      256,
    );
  }
  if ((tick & 32) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79355022692464371645785046466")),
      96,
      256,
    );
  }
  if ((tick & 64) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79482085999252804386437311141")),
      96,
      256,
    );
  }
  if ((tick & 128) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("79736823300114093921829183326")),
      96,
      256,
    );
  }
  if ((tick & 256) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("80248749790819932309965073892")),
      96,
      256,
    );
  }
  if ((tick & 512) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("81282483887344747381513967011")),
      96,
      256,
    );
  }
  if ((tick & 1024) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("83390072131320151908154831281")),
      96,
      256,
    );
  }
  if ((tick & 2048) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("87770609709833776024991924138")),
      96,
      256,
    );
  }
  if ((tick & 4096) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("97234110755111693312479820773")),
      96,
      256,
    );
  }
  if ((tick & 8192) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("119332217159966728226237229890")),
      96,
      256,
    );
  }
  if ((tick & 16384) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("179736315981702064433883588727")),
      96,
      256,
    );
  }
  if ((tick & 32768) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("407748233172238350107850275304")),
      96,
      256,
    );
  }
  if ((tick & 65536) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("2098478828474011932436660412517")),
      96,
      256,
    );
  }
  if ((tick & 131072) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("55581415166113811149459800483533")),
      96,
      256,
    );
  }
  if ((tick & 262144) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("38992368544603139932233054999993551")),
      96,
      256,
    );
  }

  return signedShiftRight(ratio, 32, 256);
}

function tickIndexToSqrtPriceNegative(tickIndex) {
  const tick = Math.abs(tickIndex);
  let ratio;

  if ((tick & 1) !== 0) {
    ratio = new BN("18445821805675392311");
  } else {
    ratio = new BN("18446744073709551616");
  }

  if ((tick & 2) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18444899583751176498")),
      64,
      256,
    );
  }
  if ((tick & 4) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18443055278223354162")),
      64,
      256,
    );
  }
  if ((tick & 8) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18439367220385604838")),
      64,
      256,
    );
  }
  if ((tick & 16) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18431993317065449817")),
      64,
      256,
    );
  }
  if ((tick & 32) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18417254355718160513")),
      64,
      256,
    );
  }
  if ((tick & 64) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18387811781193591352")),
      64,
      256,
    );
  }
  if ((tick & 128) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18329067761203520168")),
      64,
      256,
    );
  }
  if ((tick & 256) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("18212142134806087854")),
      64,
      256,
    );
  }
  if ((tick & 512) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("17980523815641551639")),
      64,
      256,
    );
  }
  if ((tick & 1024) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("17526086738831147013")),
      64,
      256,
    );
  }
  if ((tick & 2048) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("16651378430235024244")),
      64,
      256,
    );
  }
  if ((tick & 4096) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("15030750278693429944")),
      64,
      256,
    );
  }
  if ((tick & 8192) !== 0) {
    ratio = signedShiftRight(
      ratio.mul(new BN("12247334978882834399")),
      64,
      256,
    );
  }
  if ((tick & 16384) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN("8131365268884726200")), 64, 256);
  }
  if ((tick & 32768) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN("3584323654723342297")), 64, 256);
  }
  if ((tick & 65536) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN("696457651847595233")), 64, 256);
  }
  if ((tick & 131072) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN("26294789957452057")), 64, 256);
  }
  if ((tick & 262144) !== 0) {
    ratio = signedShiftRight(ratio.mul(new BN("37481735321082")), 64, 256);
  }

  return ratio;
}

function tickIndexToSqrtPriceX64(tickIndex) {
  if (tickIndex > 0) {
    return new BN(tickIndexToSqrtPricePositive(tickIndex));
  }
  return new BN(tickIndexToSqrtPriceNegative(tickIndex));
}

const SUI_HASUI_POOL_ID = "0x871d8a227114f375170f149f7e9d45be822dd003eba225e83c05ac80828596bc"
const SUI_HASUI_VAULT_ID = "0xde97452e63505df696440f86f0b805263d8659b77b8c316739106009d514c270"

BigNumber.config({
  DECIMAL_PLACES: 64,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-64, 64], // equivalent to toExpNeg and toExpPos
  MODULO_MODE: BigNumber.ROUND_DOWN,
  POW_PRECISION: 64,
});

async function calculateGSUIunderlyingSui(gSuiAmount) {
  const fields = (await getObject("0x811fe901ed2a5d75cd125912ad6110efdff8be00fe694601a94167e2bd545ac2")).fields
  const pool = Number(fields.pool)
  const pipe = Number(fields.pipe_debt.fields.value)
  const supply = Number(fields.supply.fields.value)
  const percentage = (pool + pipe)/ supply
  return percentage * Number(gSuiAmount)
}

async function calculatehaSuiSuiVaultShares(lpAmount) {
    const suiHasuiPool = (
        await getObject(SUI_HASUI_POOL_ID)
      )
      const vaultObject = (
        await getObject(SUI_HASUI_VAULT_ID)
      )

      const clmmPosition =
        vaultObject.fields.positions[0].fields.clmm_postion.fields;
      const liquidity = new BN(clmmPosition.liquidity);
      const curSqrtPrice = new BN(suiHasuiPool.fields.current_sqrt_price);
      const lowerSqrtPrice = new BN(
        tickIndexToSqrtPriceX64(Number(clmmPosition.tick_lower_index.fields.bits)),
      );
      const upperSqrtPrice = new BN(
        tickIndexToSqrtPriceX64(Number(clmmPosition.tick_upper_index.fields.bits)),
      );

      const amount = getCoinAmountFromLiquidity(
        liquidity,
        curSqrtPrice,
        lowerSqrtPrice,
        upperSqrtPrice,
      );

      const lpSupply =
        vaultObject.fields.lp_token_treasury.fields.total_supply.fields.value;

      const percentage = BigNumber(lpAmount).div(BigNumber(lpSupply));

      const coinAShare = percentage.multipliedBy(
        BigNumber(amount.coinA.toString()),
      );
      const coinBShare = percentage.multipliedBy(
        BigNumber(amount.coinB.toString()),
      );

      return({
        coinA: coinAShare.decimalPlaces(0).toNumber(),
        coinB: coinBShare.decimalPlaces(0).toNumber(),
      });

}

function getCoinAmountFromLiquidity(
  liquidity,
  curSqrtPrice,
  lowerSqrtPrice,
  upperSqrtPrice
) {
  const liq = new BigNumber(liquidity.toString());
  const curSqrtPriceStr = new BigNumber(curSqrtPrice.toString());
  const lowerPriceStr = new BigNumber(lowerSqrtPrice.toString());
  const upperPriceStr = new BigNumber(upperSqrtPrice.toString());
  let coinA;
  let coinB;
  if (curSqrtPrice.lt(lowerSqrtPrice)) {
    coinA = MathUtil.toX64_Decimal(liq)
      .multipliedBy(upperPriceStr.minus(lowerPriceStr))
      .div(lowerPriceStr.multipliedBy(upperPriceStr));
    coinB = new BigNumber(0);
  } else if (curSqrtPrice.lt(upperSqrtPrice)) {
    coinA = MathUtil.toX64_Decimal(liq)
      .multipliedBy(upperPriceStr.minus(curSqrtPriceStr))
      .div(curSqrtPriceStr.multipliedBy(upperPriceStr));

    coinB = MathUtil.fromX64_Decimal(
      liq.multipliedBy(curSqrtPriceStr.minus(lowerPriceStr)),
    );
  } else {
    coinA = new BigNumber(0);
    coinB = MathUtil.fromX64_Decimal(
      liq.multipliedBy(upperPriceStr.minus(lowerPriceStr)),
    );
  }

  return {
    coinA: coinA.decimalPlaces(0),
    coinB: coinB.decimalPlaces(0),
  };
}

class MathUtil {
  static toX64_Decimal(num) {
    return num.multipliedBy(BigNumber(2 ** 64));
  }
  static fromX64_Decimal(num) {
    return num.multipliedBy(BigNumber(2 ** -64));
  }
}

const MAINNET_PROTOCOL_ID =
  "0x9e3dab13212b27f5434416939db5dec6a319d15b89a84fd074d03ece6350d3df";
// Token
const SUI = ADDRESSES.sui.SUI;
const BUCK = ADDRESSES.sui.BUCK;
const USDC = ADDRESSES.sui.USDC;
const USDT = ADDRESSES.sui.USDT;
const HASUI = "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI";
const GSUI = "0x2f2226a22ebeb7a0e63ea39551829b238589d981d1c6dd454f01fcc513035593::house::StakedHouseCoin<0x2::sui::SUI>";
const USDC_CIRCLE = ADDRESSES.sui.USDC_CIRCLE;
const FDUSD = "0xf16e6b723f242ec745dfd7634ad072c42d5c1d9ac9d62a39c381303eaa57693a::fdusd::FDUSD";
const SCALLOP_swUSDC = "0xad4d71551d31092230db1fd482008ea42867dbf27b286e9c70a79d2a6191d58d::scallop_wormhole_usdc::SCALLOP_WORMHOLE_USDC";
const SCALLOP_sUSDC = "0x854950aa624b1df59fe64e630b2ba7c550642e9342267a33061d59fb31582da5::scallop_usdc::SCALLOP_USDC";
const SCALLOP_sUSDT = "0xe6e5a012ec20a49a3d1d57bd2b67140b96cd4d3400b9d79e541f7bdbab661f95::scallop_wormhole_usdt::SCALLOP_WORMHOLE_USDT";
const SCALLOP_sSUI = "0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b::scallop_sui::SCALLOP_SUI";
const SCALLOP_sSB_ETH = "0xb14f82d8506d139eacef109688d1b71e7236bcce9b2c0ad526abcd6aa5be7de0::scallop_sb_eth::SCALLOP_SB_ETH";
const SCALLOP_sSCA = "0x5ca17430c1d046fae9edeaa8fd76c7b4193a00d764a0ecfa9418d733ad27bc1e::scallop_sca::SCALLOP_SCA";
const SCALLOP_sDEEP = "0xeb7a05a3224837c5e5503575aed0be73c091d1ce5e43aa3c3e716e0ae614608f::scallop_deep::SCALLOP_DEEP";
const SCALLOP_sbUSDT = "0xb1d7df34829d1513b73ba17cb7ad90c88d1e104bb65ab8f62f13e0cc103783d3::scallop_sb_usdt::SCALLOP_SB_USDT";
const SCA_ADDRESS = "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA";
const SUI_HASUI_CETUS_VAULT_LP_ADDRESS = '0x828b452d2aa239d48e4120c24f4a59f451b8cd8ac76706129f4ac3bd78ac8809::lp_token::LP_TOKEN';
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

const USDC_CIRCLE_PSM =
  "0xd22388010d7bdb9f02f14805a279322a3fa3fbde42896b7fb3d1214af404c455";

const USDC_PSM =
  "0x0c2e5fbfeb5caa4c2f7c8645ffe9eca7e3c783536efef859be03146b235f9e04";

const USDT_PSM =
  "0x607e7d386e29066b964934e0eb1daa084538a79b5707c34f38e190d64e24923e";

const FDUSD_PSM = "0xb23092f74b7bbea45056d8564a7325be993cc2926b89f384367b9ad309dd92c5";

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

const navi_stSUI_sLP_ID =
  "0xd3f6b8f3c92d8f967f7e177e836770421e351b419ffe074ce57911365b4ede56";

const scallop_sUSDC_LP_ID =
  "0x7b16192d63e6fa111b0dac03f99c5ff965205455089f846804c10b10be55983c";

const scallop_sUSDT_LP_ID =
  "0x6b68b42cbb4efccd9df30466c21fff3c090279992c005c45154bd1a0d87ac725";

const scallop_sCircleUSDC_LP_ID =
  "0xdf91ef19f6038e662e9c89f111ffe19e808cdfb891d080208d15141932f9513b";

const scallop_sSuiBridgeUSDT_LP_ID =
  "0x8471787fc69ef06f4762cb60863e1c48475d79c804a000e613306adee7b7824a";

const navi_sCircleUSDC_LP_ID =
  "0xb5ed3f2e5c19f425baad3d9a0afffdc84d0550ace2372692cf93325da81e4392";

const navi_sSuiBridgeUSDT_LP_ID =
  "0x4ae310b93c65e358b6f8beb73f34d0ac7d507947d8aea404159d19883a3b1c6a";

const navi_fdUSD_LP_ID =
  "0xa2790bbd90275e35214bffd8da3c01742bb5883fde861bf566a9ecfa1b3f5090";

const haSUI_Navi_Pond_ID = "0xef1ff1334c1757d8e841035090d34b17b7aa3d491a3cb611319209169617518e"

const SUI_Navi_Pond_ID = "0xcf887d7201c259496a191348da86b4772a2e2ae3f798ca50d1247194e30b7656";

async function getStakingLPAmount(id) {
  const stakingLPObject = await sui.getObject(id);
  return stakingLPObject.fields.output_volume;
}

async function getScallopsLPAmount(id) {
  const stakingLPObject = await sui.getObject(id);
  return stakingLPObject.fields.coin_balance;
}

async function getNaviLPAmount(id) {
  const stakingLPObject = await sui.getObject(id);
  return stakingLPObject.fields.coin_balance;
}

function convertUnderlyingAssets(coin) {
  // USDC
  if(coin === SCALLOP_swUSDC) return ADDRESSES.sui.USDC
  if(coin === SCALLOP_sUSDC) return ADDRESSES.sui.USDC_CIRCLE
  // USDT
  if(coin === SCALLOP_sUSDT) return ADDRESSES.sui.USDT
  // sSUI
  if(coin === SCALLOP_sSUI) return ADDRESSES.sui.SUI
  // sbETH
  if(coin === SCALLOP_sSB_ETH) return ADDRESSES.sui.ETH
  // sSCAUSDT_PSM
  if(coin === SCALLOP_sSCA) return SCA_ADDRESS
  // sDeep
  if(coin === SCALLOP_sDEEP) return ADDRESSES.sui.DEEP
  // sSBUSDT
  if(coin === SCALLOP_sbUSDT) return ADDRESSES.sui.suiUSDT
  return coin
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

  const usdcCirclePSMObj = await sui.getObject(USDC_CIRCLE_PSM);
  const usdcCirclePSMAmount = usdcCirclePSMObj.fields.pool;

  const fdusdPSMObj = await sui.getObject(FDUSD_PSM);
  const fdusdPSMAmount = fdusdPSMObj.fields.pool;

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
    const coin_address = bucket.type.slice(bucket.type.indexOf("<") + 1, bucket.type.lastIndexOf(">"))

    /// Since we're unable to fetch the price of Scallop's sCOIN, we'll regard sCOIN as underlying assets
    const coin = convertUnderlyingAssets(coin_address)

    if(coin == SUI_HASUI_CETUS_VAULT_LP_ADDRESS) {
      const {coinA: haSuiAmount, coinB: suiAmount} = await calculatehaSuiSuiVaultShares(bucket.fields.collateral_vault)
      api.add(HASUI, haSuiAmount)
      api.add(SUI, suiAmount)
    } else if(coin == GSUI) {
      const suiAmount = await calculateGSUIunderlyingSui(bucket.fields.collateral_vault)
      api.add(SUI, suiAmount);
    } else {
      api.add(coin, bucket.fields.collateral_vault);
    }
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

  api.add(USDC_CIRCLE, Math.floor(usdcCirclePSMAmount));
  api.add(USDC, Math.floor(usdcPSMAmount));
  api.add(USDT, Math.floor(usdtPSMAmount));
  api.add(FDUSD, Math.floor(fdusdPSMAmount));

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

  const snavistSUILPAmount = await getStakingLPAmount(navi_stSUI_sLP_ID);
  api.add(
    "0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55::stsui::STSUI",
    snavistSUILPAmount
  );

  const haSuiNaviPondAmount = await getStakingLPAmount(haSUI_Navi_Pond_ID);
  api.add(
    "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI",
    haSuiNaviPondAmount
  );

  const suiNaviPondAmount = await getStakingLPAmount(SUI_Navi_Pond_ID);
  api.add(
    SUI,
    suiNaviPondAmount
  );

  const scallopUSDC_LPAmount = await getScallopsLPAmount(scallop_sUSDC_LP_ID);
  api.add(USDC, scallopUSDC_LPAmount);

  const scallopUSDT_LPAmount = await getScallopsLPAmount(scallop_sUSDT_LP_ID);
  api.add(USDT, scallopUSDT_LPAmount);

  const scallopCircleUSDC_LPAmount = await getScallopsLPAmount(scallop_sCircleUSDC_LP_ID);
  api.add(USDC_CIRCLE, scallopCircleUSDC_LPAmount);

  const scallopSuiBridgeUSDT_LPAmount = await getScallopsLPAmount(scallop_sSuiBridgeUSDT_LP_ID);
  api.add(ADDRESSES.sui.suiUSDT, scallopSuiBridgeUSDT_LPAmount);

  const naviCircleUSDC_LPAmount = await getNaviLPAmount(navi_sCircleUSDC_LP_ID);
  api.add(USDC_CIRCLE, naviCircleUSDC_LPAmount);

  const naviSuiBridgeUSDT_LPAmount = await getNaviLPAmount(navi_sSuiBridgeUSDT_LP_ID);
  api.add(ADDRESSES.sui.suiUSDT, naviSuiBridgeUSDT_LPAmount);

  const naviFDUSD_LPAmount = await getNaviLPAmount(navi_fdUSD_LP_ID);
  api.add(FDUSD, naviFDUSD_LPAmount);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
