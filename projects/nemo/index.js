const sui = require("../helper/chain/sui");
const BigNumber = require("bignumber.js");
const {COIN_CONFIG} = require("./coinConfig.js");
const sdk = require("../helper/utils");

const {textToBytes, hexToBytes, toU64, desU128} = require("./bytes");
const {getScallopTokenExchangeRate} = require("./price");

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
  '0x622345b3f80ea5947567760eec7b9639d0582adcfd6ab9fccb85437aeda7c0d0::scallop_wal::SCALLOP_WAL'
]

async function tvl(api) {
  const marketIds = await sui.queryEvents({
    eventType: `${nemoPackageId}::market_factory::MarketCreatedEvent`,
    transform: i => i.market_id
  });

  console.log('marketIds', marketIds);

  const markets = await sui.getObjects(marketIds);

  console.log('marketIds', markets);

  const syAmounts = ["1000", "100", "10", "1"]

  for (const market of markets) {
    if (!market) continue;

    const {type, fields} = market;
    try {
      const typeString = type.replace(">", "").split("<")[1];
      if (!typeString) continue;

      const syTokens = typeString.split(", ")[0].slice(2);
      const tokensObject = await sui.getDynamicFieldObject(syTableParentId, syTokens, {idType: "0x1::type_name::TypeName"});
      const tokens = "0x" + tokensObject.fields.value.fields.name;

      console.log("tokens", syTokens, tokens, fields.total_sy, fields.total_pt);

      const coinConfig = COIN_CONFIG[tokens];

      if (!coinConfig) {
        console.log('coinConfig undefined', tokens);
        continue;
      } else {
        // sdk.log('coinConfig', tokens, coinConfig);
      }

      if (
        !watchCoinType.includes(coinConfig.coinType)
      ) {
        continue;
      }

      for (const syAmount of syAmounts) {
        try {
          const txBlockBytes = await getScallopTokenExchangeRate(coinConfig);

          const inspectionResult = await sui.call(
            'sui_devInspectTransactionBlock',
            ['0x0000000000000000000000000000000000000000000000000000000000000000',
              Buffer.from(txBlockBytes).toString('base64')],
            {withMetadata: true}
          );

          if (inspectionResult?.effects?.status?.status !== 'success') {
            throw new Error(JSON.stringify(inspectionResult, null, 2));
          }

          const returnValues = inspectionResult.results[0].returnValues;
          const res1 = returnValues[0][0];
          const res2 = returnValues[1][0];
          const priceVoucher1 = desU128(Uint8Array.from(res1));
          const priceVoucher2 = desU128(Uint8Array.from(res2));

          let rate1 = new BigNumber(priceVoucher1).div(new BigNumber(2).pow(64)).toString();
          let rate2 = new BigNumber(priceVoucher2).div(new BigNumber(2).pow(64)).toString();

          console.log('priceVoucher rate1', rate1, rate2, coinConfig.coinType);

          const pt2SyAmount = new BigNumber(fields.total_pt).div(rate1);
          let syBalance = BigNumber.sum(pt2SyAmount, new BigNumber(fields.total_sy));

          sdk.log('devInspectTransactionBlock pt2SyAmount', pt2SyAmount.toString(), syBalance.toString(), rate1, rate2)

          if (coinConfig.provider === "Scallop") {
            let underlyingBalance = syBalance.multipliedBy(rate2);
            api.add(coinConfig.underlyingCoinType, underlyingBalance.toNumber());
          } else {
            api.add(tokens, syBalance.toNumber());
          }

          break;
        } catch (e) {
          console.log('devInspectTransactionBlock error', e);
        }
      }
    } catch (error) {
      console.error(`error: ${type}`, error);
    }
  }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};