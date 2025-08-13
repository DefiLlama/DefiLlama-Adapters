const sui = require("../helper/chain/sui");
const BigNumber = require("bignumber.js");
const {COIN_CONFIG, MMT_TYPE_CONFIG} = require("../nemo/coinConfig.js");
const {desU64} = require("../nemo/bytes");
const {getExchangeRate} = require("../nemo/price");
const {getVaultTvlByAmountB} = require("../nemo/util");
const {sleep} = require("../helper/utils");

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
  '0xb1b0650a8862e30e3f604fd6c5838bc25464b8d3d827fbd58af7cb9685b832bf::wwal::WWAL',
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
  // '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI',
  // '0x8b4d553839b219c3fd47608a0cc3d5fcc572cb25d41b7df3833208586a8d2470::hawal::HAWAL',
];

async function tvl(api) {
  const marketIds = [
    "0x50f457c30c02bb4cf186276a8798dfc5683aa16e54316d9e52d7b2ff8d23eed3",
    "0x022ee5ac9439ca13e30472e309dfac38bf054d67e7c0e851d424c229fc718eab",
    "0x7472959314b24ebfbd4da49cc36abb3da29f722746019c692407aaf6b47e9a08",
    "0x608ecc23a8c980cc8a95a0ee2e6f9824a70ff8189139e6268702cfbe4c82b684",
    "0x47f91edf5774bcc88872832570ef00785c2d81faa44e1774de662c51605e8900",
    "0xa7a2e0cfd15b47ee77434a0a6a0319cb7344a89f1f533c6b7ffc7fa326a2cb8f",
    "0x0620a3174f584a8f481f787e3dd0c0ecc47e833f98195e25a7e0a879c81945b3",
    "0x4a922df356c27a71357050235fa59ff76494ef7bda5399ec2302bd3347154f4b",
    "0xf8b4342324f0cfa17998beacfd5f8cfed85f0f7c8a6b567c65796dfdb1a75c9c",
    "0x2d4f90a110115d08d2a52215582b9176f1d0560cb11e8ae8ec4fe0a553f27b7e",
    "0x4d96db8d555a16d9f569e93695f274a09d9a6c0d4b5ad2a6f6ab8661a5c0f29b",
    "0x454de5b6d5fb2f4b40f9d2ae6d9731e89d498fd6e5daffb6ac35cc4b478c84ed",
    "0xb5cba43495bf7c72b249ee8038a73284f28d87eefa60a13128cb82f0dc696d4f",
    "0xe4750dcb02e072a25632d71a1edc0c22d4e4fa6d57eb6d00672f87d1d6f973f9",
    "0x80815dd01d4e2ce4319a1eae8e6fafa60ec1da6f713477ee8475b0cea33d2e35",
    "0x13eef2babfb2750df8e678ede4c1e1cc7692a5109479c6bb7d27f236c36c2eba",
    "0x027e037e3b0e73defd8a256ab9d5f6bf637e051a810941f823ac46337829b2ea",
    "0x4cdaea912a0000f83cfdf1acd58758a3e2ab47645ea76a6a7b4ad64f3d8b0611",
    "0xed8a68acf3f13c93b1852c3af3482d5ea057c6a6630ba526f30b1c3bf844cf64",
    "0xd0564d99dd0fc96842b29bfc516652854887fadec6d0af88689f712eb37dc07f",
    "0xa2cbc5218aa403e028c84df454e7b6417067739e436a250f84a9b2d8abb5b773",
    "0x2c1d1803b890b0600ba606aa935553472b8b08a81dcef67e2ba7504d43fa6234",
    "0xb13b492e36200638bb7380be9e4975f2b7c3b9af55f201c22e6cbad2dd942788"
  ]

  const markets = await sui.getObjects(marketIds);

  for (const market of markets) {
    if (!market) continue;

    const {type, fields} = market;

    try {
      await getTvl(type, fields, api);
    } catch (error) {
      console.error(`error: ${type}`, error);
      await sleep(10000); // Wait for 10 seconds before retrying

      try {
        await getTvl(type, fields, api);
      } catch (error) {
        console.error(`Retry failed for market ${fields.id}:`, error);
      }
    }
  }
}

async function getTvl(type, fields, api) {
  const typeString = type.replace(">", "").split("<")[1];
  if (!typeString) return null;

  const syTokens = typeString.split(", ")[0].slice(2);
  console.log(`[syTokens:] ${typeString} ${syTokens}`);

  const tokensObject = await sui.getDynamicFieldObject(syTableParentId, syTokens, {idType: "0x1::type_name::TypeName"});
  const tokens = "0x" + tokensObject.fields.value.fields.name;

  console.log(`[${typeString}] ${tokens}`);

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
    throw new Error(JSON.stringify(inspectionResult, null, 2));
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
  } else {
    let rate1 = new BigNumber(priceVoucher1).div(new BigNumber(2).pow(64)).toString();
    let rate2 = new BigNumber(priceVoucher2).div(new BigNumber(2).pow(64)).toString();

    const pt2SyAmount = floatingPt.div(rate1);

    if (watchCoinTypeNotConvert.includes(coinConfig.coinType)) {
      api.add(tokens, pt2SyAmount.toFixed(0));
    } else {
      let underlyingBalance = pt2SyAmount.multipliedBy(rate2);
      api.add(coinConfig.underlyingCoinType, underlyingBalance.toFixed(0));
    }
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Count all floating PT assets in the Nemo markets.',
  sui: {
    tvl,
  },
};