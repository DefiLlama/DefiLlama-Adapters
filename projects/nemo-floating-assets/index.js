const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");
const BigNumber = require("bignumber.js");
const {COIN_CONFIG, MMT_TYPE_CONFIG} = require("../nemo/coinConfig.js");
const {desU64} = require("../nemo/bytes");
const {getExchangeRate} = require("../nemo/price");
const {getVaultTvlByAmountB, getDynamicFieldObject} = require("../nemo/util");

const nemoPackageId = "0x2b71664477755b90f9fb71c9c944d5d0d3832fec969260e3f18efc7d855f57c4";
const syTableParentId = "0xcb74e46f4049e1afc3edcd77172ac6f9adfe1068cec6ca99ff6b80ca7879bd33";

const watchCoinType = [
  '0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b::scallop_sui::SCALLOP_SUI',
  '0x854950aa624b1df59fe64e630b2ba7c550642e9342267a33061d59fb31582da5::scallop_usdc::SCALLOP_USDC',
  '0x5ca17430c1d046fae9edeaa8fd76c7b4193a00d764a0ecfa9418d733ad27bc1e::scallop_sca::SCALLOP_SCA',
  '0xeb7a05a3224837c5e5503575aed0be73c091d1ce5e43aa3c3e716e0ae614608f::scallop_deep::SCALLOP_DEEP',
  '0xb1d7df34829d1513b73ba17cb7ad90c88d1e104bb65ab8f62f13e0cc103783d3::scallop_sb_usdt::SCALLOP_SB_USDT',
  '0xb14f82d8506d139eacef109688d1b71e7236bcce9b2c0ad526abcd6aa5be7de0::scallop_sb_eth::SCALLOP_SB_ETH',
  '0xd285cbbf54c87fd93cd15227547467bb3e405da8bbf2ab99f83f323f88ac9a65::scallop_usdy::SCALLOP_USDY',
  '0x0a228d1c59071eccf3716076a1f71216846ee256d9fb07ea11fb7c1eb56435a5::scallop_musd::SCALLOP_MUSD',
  '0x622345b3f80ea5947567760eec7b9639d0582adcfd6ab9fccb85437aeda7c0d0::scallop_wal::SCALLOP_WAL',
  '0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI',
  '0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55::stsui::STSUI',
  '0xd8b855d48fb4d8ffbb5c4a3ecac27b00f3712ce58626deb5a16a290e0c6edf84::nwal::NWAL',
  '0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI',
  '0x922d15d7f55c13fd790f6e54397470ec592caa2b508df292a2e8553f3d3b274f::msui::MSUI',
  '0x502867b177303bf1bf226245fcdd3403c177e78d175a55a56c0602c7ff51c7fa::trevin_sui::TREVIN_SUI',
  '0x41ff228bfd566f0c707173ee6413962a77e3929588d010250e4e76f0d1cc0ad4::ksui::KSUI',
  '0x285b49635f4ed253967a2a4a5f0c5aea2cbd9dd0fc427b4086f3fad7ccef2c29::i_sui::I_SUI',
  '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT',
  '0xd01d27939064d79e4ae1179cd11cfeeff23943f32b1a842ea1a1e15a0045d77d::st_sbuck::ST_SBUCK',
  "0x7f29e761222a44b2141596e920edcc9049f8610f9d33f5354454d088e1f53b62::x_sui_sui_nevlp::X_SUI_SUI_NEVLP",
  "0x295d7f569467934c934e6101284628ecbbb1e68d5c5baa8d4667ff09c42068ad::suiusdt_usdc_nevlp::SUIUSDT_USDC_NEVLP"
];

const watchCoinTypeNotConvert = [
  '0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI',
  '0x790f258062909e3a0ffc78b3c53ac2f62d7084c3bab95644bdeb05add7250001::super_sui::SUPER_SUI',
  '0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55::stsui::STSUI',
  '0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI',
  '0x02358129a7d66f943786a10b518fdc79145f1fc8d23420d9948c4aeea190f603::fud_sui::FUD_SUI',
  '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT',
];

async function tvl(api) {
  const marketIds = await sui.queryEvents({
    eventType: `${nemoPackageId}::market_factory::MarketCreatedEvent`,
    transform: i => i.market_id
  });

  const markets = await sui.getObjects(marketIds);

  for (const market of markets) {
    if (!market) continue;

    const {type, fields} = market;
    await getTvl(type, fields, api);
  }
}

async function getTvl(type, fields, api) {
  const typeString = type.replace(">", "").split("<")[1];
  if (!typeString) return null;

  const syTokens = typeString.split(", ")[0].slice(2);

  const tokensObject = await getDynamicFieldObject(
    syTableParentId, syTokens, {idType: "0x1::type_name::TypeName"});
  if (!tokensObject || !tokensObject.content) return null;

  const tokens = "0x" + tokensObject.content.fields.value.fields.name;

  const coinConfig = COIN_CONFIG[tokens];

  if (!coinConfig) return null;
  if (!watchCoinType.includes(coinConfig.coinType)) return null;

  const txBlockBytes = await getExchangeRate(coinConfig);

  const inspectionResult = await sui.call(
    'sui_devInspectTransactionBlock',
    ['0x0000000000000000000000000000000000000000000000000000000000000000',
      Buffer.from(txBlockBytes).toString('base64')],
    {withMetadata: true}
  );

  if (inspectionResult?.effects?.status?.status !== 'success') {
    return null;
  }

  const returnValues = inspectionResult.results[inspectionResult.results?.length - 1].returnValues;
  const res1 = returnValues[0][0];
  const res2 = returnValues[1][0];
  const priceVoucher1 = desU64(Uint8Array.from(res1));
  const priceVoucher2 = desU64(Uint8Array.from(res2));

  const pyState = await sui.getObject(fields.py_state_id);
  const ptSupply = pyState.fields.pt_supply;
  const floatingPt = BigNumber(ptSupply).minus(fields.total_pt);

  if (coinConfig.provider === 'Nemo') {
    const pt2SyAmount = floatingPt.div(priceVoucher1).times(priceVoucher2);

    console.log(`floatingPt: ${floatingPt.toString()}, ptSupply: ${ptSupply}, pt2SyAmount: ${pt2SyAmount.toString()}, marketId: ${fields.id.id}`);

    const vault = await sui.getObject(MMT_TYPE_CONFIG[coinConfig.coinType].VAULT_ID);
    const amountB = await getVaultTvlByAmountB(vault);

    const totalSupply = vault.fields.treasury_cap.fields.total_supply.fields.value;

    const lpTokenPrice = BigNumber(amountB).div(BigNumber(totalSupply));

    console.log(`lpTokenPrice: ${lpTokenPrice.toString()}, amountB: ${amountB}, totalSupply: ${totalSupply}`);

    api.add(coinConfig.underlyingCoinType, pt2SyAmount.times(lpTokenPrice).toFixed(0));
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Count all floating PT assets in the Nemo markets.',
  sui: {
    tvl,
  },
};