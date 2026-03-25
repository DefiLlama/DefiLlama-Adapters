const ADDRESSES = require('../helper/coreAssets.json')
const {
  SPRING_SUI_STAKING_INFO_LIST,
  Winter_Blizzard_Staking_List,
  WWAL,
  HAEDAL,
  SSBUCK,
  VOLO,
  SUPER_SUI,
  AFTERMATH,
  ALPAHFI
} = require("./constants");
const {hexToBytes, toU64, textToBytes} = require("./bytes");
const {MMT_TYPE_CONFIG, VAULT_CONFIG, MMT, PYTH_ORACLE_MAP} = require("./coinConfig");
const sui = require("../helper/chain/sui");
const {getObjects} = require("./util");

const ProgrammableTransactionIndex = 0;
const PureIndex = 0;
const BoolIndex = 1;
const U64Index = 8;
const ObjectIndex = 1;
const SharedObjectIndex = 1;
const MoveCallIndex = 0;
const StructIndex = 7;
const InputIndex = 1;
const ResultIndex = 2;

function parseSuiAddress(str) {
  if (str === ADDRESSES.sui.SUI) {
    str = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
  }
  const STRUCT_REGEX = /^([^:]+)::([^:]+)::([^<]+)(<(.+)>)?/;
  const structMatch = str.match(STRUCT_REGEX);
  if (structMatch) {
    return {
      address: structMatch[1],
      module: structMatch[2],
      name: structMatch[3],
      typeParams: [],
    };
  }

  throw new Error(`Encountered unexpected token when parsing type args for ${str}`);
}

async function getExchangeRate(coinConfig) {
  if (coinConfig.provider === 'Scallop') {
    return await getScallopTokenExchangeRate(coinConfig);
  } else if (coinConfig.provider === 'Nemo') {
    return await getNemoTokenExchangeRate(coinConfig);
  } else if (coinConfig.coinType === '0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI') {
    return await getAfsuiTokenExchangeRate(coinConfig);
  } else if (coinConfig.coinType === '0x790f258062909e3a0ffc78b3c53ac2f62d7084c3bab95644bdeb05add7250001::super_sui::SUPER_SUI') {
    return await getSupersuiTokenExchangeRate(coinConfig);
  } else if (coinConfig.provider === 'AlphaFi') {
    return await getAlphafiTokenExchangeRate(coinConfig);
  } else if (coinConfig.provider === 'Winter') {
    return await getBlizzardTokenExchangeRate(coinConfig);
  } else if (coinConfig.provider === "SpringSui") {
    return await getSpringTokenExchangeRate(coinConfig);
  } else if (coinConfig.provider === "Volo") {
    return await getVoloTokenExchangeRate(coinConfig);
  } else if (coinConfig.coinType === "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI") {
    return await getHasuiTokenExchangeRate(coinConfig);
  } else if (coinConfig.coinType === "0x8b4d553839b219c3fd47608a0cc3d5fcc572cb25d41b7df3833208586a8d2470::hawal::HAWAL") {
    return await getHawalTokenExchangeRate(coinConfig);
  } else if (coinConfig.coinType === "0xd01d27939064d79e4ae1179cd11cfeeff23943f32b1a842ea1a1e15a0045d77d::st_sbuck::ST_SBUCK") {
    return await getBuckTokenExchangeRate(coinConfig);
  }
  return [];
}

async function getScallopTokenExchangeRate(coinConfig) {
  let scallopVersion = getScallopVersion(coinConfig.coinType);
  const kind = generateKind(
    [
      coinConfig.priceOracleConfigId,
      coinConfig.oracleTicket,
      coinConfig.providerVersion,
      coinConfig.providerMarket,
      coinConfig.syStateId,
      coinConfig.pyStateId,
      coinConfig.marketFactoryConfigId,
      coinConfig.marketStateId,
      "0x0000000000000000000000000000000000000000000000000000000000000006"
    ],
    scallopVersion,
    [true, false, false, true, false, true, false, true, false],
    '0x14c26838b7a307b81169eb7c20d9fd1adaf2de4f0e6ea7853a9c9689ba840567',
    'scallop',
    'get_scallop_token_exchange_rate',
    [coinConfig.syCoinType, coinConfig.underlyingCoinType]
  );

  return generateTxBytes(kind, 9);
}

async function getAfsuiTokenExchangeRate(coinConfig) {
  const kind = generateKind(
    [
      coinConfig.priceOracleConfigId,
      coinConfig.oracleTicket,
      '0x2f8f6d5da7f13ea37daa397724280483ed062769813b6f31e9788e59cc88994d',
      '0xeb685899830dd5837b47007809c76d91a098d52aabbf61e8ac467c59e5cc4610',
      '0xccd3898005a269c1e9074fe28bca2ff46784e8ee7c13b576862d9758266c3a4d',
      '0xcb27f9938f140bea67eea396fc5b0c6c6dda51537d22bf4101a38efaa76884af',
      '0x4a8d13937be10f97e450d1b8eb5846b749f9d3f470243b6cfa660e3d75b1fc49',
      '0x2d4f90a110115d08d2a52215582b9176f1d0560cb11e8ae8ec4fe0a553f27b7e',
      "0x0000000000000000000000000000000000000000000000000000000000000006"
    ],
    [497420735, 499209575, 32696040, 32347695, 497420736, 499209572, 497676325, 499209573, 1],
    [true, false, false, false, false, true, false, true, false],
    '0xaf839645bf2493a723e8e9aaef46d55a6316a89f6f821f42c9e21b5e5ad86183',
    'aftermath',
    'get_exchange_rate_from_aftermath',
    [
      '0x37f1fa1fb1d14d313ed8581ebda56ee34bde20c463a08562f7cb5aadc03e17f5::afSUI::AFSUI',
      '0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI'
    ]
  );

  return generateTxBytes(kind, 9);
}

async function getSupersuiTokenExchangeRate(coinConfig) {
  const kind = {
    "ProgrammableTransaction": {
      "inputs": [
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.priceOracleConfigId,
              "initialSharedVersion": 497420735,
              "mutable": true
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.oracleTicket,
              "initialSharedVersion": 516127338,
              "mutable": false
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": SUPER_SUI.REGISTRY,
              "initialSharedVersion": 487394894,
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": SUPER_SUI.VAULT,
              "initialSharedVersion": 488551027,
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.syStateId,
              "initialSharedVersion": 497420736,
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.pyStateId,
              "initialSharedVersion": 516127339,
              "mutable": true,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.marketFactoryConfigId,
              "initialSharedVersion": 497676325,
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.marketStateId,
              "initialSharedVersion": 516127340,
              "mutable": true,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": "0x0000000000000000000000000000000000000000000000000000000000000006",
              "initialSharedVersion": 1,
              "mutable": false,
            }
          },
        }
      ],
      "commands": [{
        "MoveCall": {
          "package": '0xaf839645bf2493a723e8e9aaef46d55a6316a89f6f821f42c9e21b5e5ad86183',
          "module": "aftermath",
          "function": "get_exchange_rate_from_aftermath",
          "typeArguments": [coinConfig.syCoinType, coinConfig.coinType],
          "arguments": [
            {
              "Input": 0
            },
            {
              "Input": 1
            },
            {
              "Input": 2
            },
            {
              "Input": 3
            },
            {
              "Input": 4
            },
            {
              "Input": 5
            },
            {
              "Input": 6
            },
            {
              "Input": 7
            },
            {
              "Input": 8
            }
          ],
        }
      }]
    }
  };

  return generateTxBytes(kind, 9);
}

async function getAlphafiTokenExchangeRate(coinConfig) {
  const kind = generateKind(
    [
      '0xb9cc723bf7494325be2f3333a3fb72f46d53abe3603e3f326fc761287850db0e',
      '0x18c0b07f0e1adbb6144b142b179b0671d966b5478da88480fa475bfa25a35063',
      '0x1adb343ab351458e151bc392fbf1558b3332467f23bda45ae67cd355a57fd5f5',
      '0xccd3898005a269c1e9074fe28bca2ff46784e8ee7c13b576862d9758266c3a4d',
      '0x3529e4ad3d7627a5612f58518432c1abcb1c67d44f1e270a6c75c156ec3e95ef',
      '0x4a8d13937be10f97e450d1b8eb5846b749f9d3f470243b6cfa660e3d75b1fc49',
      '0xe4750dcb02e072a25632d71a1edc0c22d4e4fa6d57eb6d00672f87d1d6f973f9',
      '0x0000000000000000000000000000000000000000000000000000000000000006'
    ],
    [497420735, 499650241, 443441850, 497420736, 499747225, 497676325, 499747226, 1],
    [true, false, false, false, true, false, true, false],
    '0x724fadf3aca4508c83c323a1f4ef6f71983e0110e1800c997938341d8e9ad610',
    'alphafi',
    'get_exchange_rate_from_alphafi',
    [coinConfig.syCoinType, coinConfig.coinType]
  );
  return generateTxBytes(kind, 8);
}

async function getBlizzardTokenExchangeRate(coinConfig) {
  const blizzardStaking = Winter_Blizzard_Staking_List.find(
    (item) => item.coinType === coinConfig.coinType,
  )?.value

  if (!blizzardStaking) {
    throw new Error("Winter blizzard staking not found")
  }
  let blizzardVersion = getBlizzardVersion(coinConfig.coinType);

  const kind = generateKind(
    [
      coinConfig.priceOracleConfigId,
      coinConfig.oracleTicket,
      blizzardStaking,
      WWAL.WALRUS_STAKING,
      coinConfig.syStateId,
      coinConfig.pyStateId,
      coinConfig.marketFactoryConfigId,
      coinConfig.marketStateId,
      '0x0000000000000000000000000000000000000000000000000000000000000006'
    ],
    blizzardVersion,
    [true, false, true, false, false, true, false, true, false],
    '0x28aa6089c871dd6a598db5150a79efe987845e77c1c06b9f7238aa29edeb52c2',
    'haedal',
    'get_exchange_rate_from_blizzard',
    [coinConfig.syCoinType, coinConfig.coinType]
  );
  return generateTxBytes(kind, 9);
}

async function getSpringTokenExchangeRate(coinConfig) {
  const lstInfo = SPRING_SUI_STAKING_INFO_LIST.find(
    (item) => item.coinType === coinConfig.coinType,
  )?.value

  if (!lstInfo) {
    throw new Error(`SpringSui: lstInfo not found for ${coinConfig.coinType}`)
  }

  let springVersion = getSpringVersion(coinConfig.coinType);
  const kind = generateKind(
    [
      coinConfig.priceOracleConfigId,
      coinConfig.oracleTicket,
      lstInfo,
      coinConfig.syStateId,
      coinConfig.pyStateId,
      coinConfig.marketFactoryConfigId,
      coinConfig.marketStateId,
      '0x0000000000000000000000000000000000000000000000000000000000000006'
    ],
    springVersion,
    [true, false, false, false, true, false, true, false],
    '0xa38b880ac63a6da825608778d16f7fb3562aa848699e652aee43a29eff4f61c7',
    'spring',
    'get_exchange_rate_from_spring',
    [coinConfig.syCoinType, coinConfig.coinType]
  );
  return generateTxBytes(kind, 8);
}

async function getVoloTokenExchangeRate(coinConfig) {
  const kind = generateKind(
    [
      coinConfig.priceOracleConfigId,
      coinConfig.oracleTicket,
      VOLO.NATIVE_POOL,
      VOLO.METADATA,
      coinConfig.syStateId,
      coinConfig.pyStateId,
      coinConfig.marketFactoryConfigId,
      coinConfig.marketStateId,
      '0x0000000000000000000000000000000000000000000000000000000000000006'
    ],
    [497420735, 566116225, 552477718, 34377055, 497420736, 508837694, 497676325, 508837695, 1],
    [true, false, false, false, false, true, false, true, false],
    '0x94117d224a7847445107c6e0c49aa963c0362ae1a118569b43669ccc9da8a20a',
    'volo',
    'get_exchange_rate_from_volo',
    [coinConfig.syCoinType]
  );

  return generateTxBytes(kind, 9);
}

async function getHasuiTokenExchangeRate(coinConfig) {
  const kind = {
    "ProgrammableTransaction": {
      "inputs": [
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.priceOracleConfigId,
              "initialSharedVersion": 497420735,
              "mutable": true
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.oracleTicket,
              "initialSharedVersion": 502433348,
              "mutable": false
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": HAEDAL.HAEDAL_STAKING_ID,
              "initialSharedVersion": 24060192,
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.syStateId,
              "initialSharedVersion": 497420736,
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.pyStateId,
              "initialSharedVersion": 503058772,
              "mutable": true,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.marketFactoryConfigId,
              "initialSharedVersion": 497676325,
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.marketStateId,
              "initialSharedVersion": 503058773,
              "mutable": true,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": "0x0000000000000000000000000000000000000000000000000000000000000006",
              "initialSharedVersion": 1,
              "mutable": false,
            }
          },
        }
      ],
      "commands": [{
        "MoveCall": {
          "package": '0x976e25fbe670f007b5061eb99bf6c6c698bd52ac3863aeab69997cad28a4cefd',
          "module": "haedal",
          "function": "get_exchange_rate_from_haSui",
          "typeArguments": [coinConfig.syCoinType, coinConfig.coinType],
          "arguments": [
            {
              "Input": 0
            },
            {
              "Input": 1
            },
            {
              "Input": 2
            },
            {
              "Input": 3
            },
            {
              "Input": 4
            },
            {
              "Input": 5
            },
            {
              "Input": 6
            },
            {
              "Input": 7
            }
          ],
        }
      }]
    }
  };
  return generateTxBytes(kind, 8);
}

async function getHawalTokenExchangeRate(coinConfig) {
  const kind = {
    "ProgrammableTransaction": {
      "inputs": [
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.priceOracleConfigId,
              "initialSharedVersion": 497420735,
              "mutable": true
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.oracleTicket,
              "initialSharedVersion": 529022461,
              "mutable": false
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": HAEDAL.HAEDAL_STAKING_ID,
              "initialSharedVersion": 24060192,
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.syStateId,
              "initialSharedVersion": 497420736,
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.pyStateId,
              "initialSharedVersion": 527717584,
              "mutable": true,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.marketFactoryConfigId,
              "initialSharedVersion": 497676325,
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.marketStateId,
              "initialSharedVersion": 527717585,
              "mutable": true,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": "0x0000000000000000000000000000000000000000000000000000000000000006",
              "initialSharedVersion": 1,
              "mutable": false,
            }
          },
        }
      ],
      "commands": [{
        "MoveCall": {
          "package": '0x976e25fbe670f007b5061eb99bf6c6c698bd52ac3863aeab69997cad28a4cefd',
          "module": "haedal",
          "function": "get_exchange_rate_from_haSui",
          "typeArguments": [coinConfig.syCoinType, coinConfig.coinType],
          "arguments": [
            {
              "Input": 0
            },
            {
              "Input": 1
            },
            {
              "Input": 2
            },
            {
              "Input": 3
            },
            {
              "Input": 4
            },
            {
              "Input": 5
            },
            {
              "Input": 6
            },
            {
              "Input": 7
            }
          ],
        }
      }]
    }
  };
  return generateTxBytes(kind, 8);
}

async function getBuckTokenExchangeRate(coinConfig) {
  const kind = generateKind(
    [
      coinConfig.priceOracleConfigId,
      coinConfig.oracleTicket,
      SSBUCK.VAULT,
      coinConfig.pyStateId,
      coinConfig.marketFactoryConfigId,
      coinConfig.marketStateId,
      '0x0000000000000000000000000000000000000000000000000000000000000006'
    ],
    [497420735, 497420765, 261896418, 498195773, 497676325, 498195774, 1],
    [true, false, false, true, false, true, false],
    '0xe33adb7bec8ddc73e73444f15b6703c89a86fa642b3974208228910b8d59f091',
    'buck',
    'get_exchange_rate_from_ssbuck',
    [coinConfig.syCoinType, coinConfig.coinType]
  );

  return generateTxBytes(kind, 7);
}

async function getNemoTokenExchangeRate(coinConfig) {
  // console.log('getNemoTokenExchangeRate called with coinConfig:', coinConfig.coinType);
  switch (coinConfig.coinType) {
    case "0x7f29e761222a44b2141596e920edcc9049f8610f9d33f5354454d088e1f53b62::x_sui_sui_nevlp::X_SUI_SUI_NEVLP": {
      const lstInfo = SPRING_SUI_STAKING_INFO_LIST.find(
        (item) =>
          item.coinType === MMT_TYPE_CONFIG[coinConfig.coinType].COIN_A_TYPE
      )?.value

      if (!lstInfo) {
        throw new Error(`SpringSui: lstInfo not found for ${coinConfig.coinType}`)
      }

      const objects = await getObjects([
        coinConfig.priceOracleConfigId,
        coinConfig.oracleTicket,
        lstInfo,
        MMT_TYPE_CONFIG[coinConfig.coinType].VAULT_ID,
        MMT_TYPE_CONFIG[coinConfig.coinType].POOL_ID,
        coinConfig.syStateId,
        coinConfig.pyStateId,
        coinConfig.marketFactoryConfigId,
        coinConfig.marketStateId,
        '0x0000000000000000000000000000000000000000000000000000000000000006'
      ]);
      const versionList = objects.map((obj) => obj.data.owner.Shared.initial_shared_version)
      // console.log('objects', JSON.stringify(objects), JSON.stringify(versionList));

      const kind = generateKind(
        [
          coinConfig.priceOracleConfigId,
          coinConfig.oracleTicket,
          lstInfo,
          MMT_TYPE_CONFIG[coinConfig.coinType].VAULT_ID,
          MMT_TYPE_CONFIG[coinConfig.coinType].POOL_ID,
          coinConfig.syStateId,
        ],
        versionList.splice(0, 6),
        [true, false, false, false, false, false, true, false],
        coinConfig.oraclePackageId,
        'spring',
        'get_price_voucher_in_sui_from_mmt_vault',
        [
          coinConfig.syCoinType,
          MMT_TYPE_CONFIG[coinConfig.coinType].COIN_A_TYPE,
          coinConfig.coinType,
          MMT_TYPE_CONFIG[coinConfig.coinType].CONFIG_TYPE,
        ],
        {
          syAmount: 1000000,
          minPtAmount: 0,
          objectId: [
            coinConfig.pyStateId,
            coinConfig.marketFactoryConfigId,
            coinConfig.marketStateId,
            "0x0000000000000000000000000000000000000000000000000000000000000006"
          ],
          version: versionList.splice(-4),
          typeArgs: [coinConfig.syCoinType]
        }
      );
      // console.log('Generated kind for X_SUI_SUI_NEVLP:', JSON.stringify(kind));
      return generateTxBytes(kind, 8);
    }
    default:
      const objects = await getObjects([
        MMT.MMT_ORACLE_ID,
        MMT.REGISTRY_ID,
        MMT.ORACLE_STATE,
        PYTH_ORACLE_MAP[MMT_TYPE_CONFIG[coinConfig.coinType].COIN_A_TYPE].priceInfoObjectId,
        MMT.SET_PRICE_CAP_REGISTRY,
        MMT.CLOCK_ADDRESS,
        coinConfig.priceOracleConfigId,
        coinConfig.oracleTicket,
        MMT_TYPE_CONFIG[coinConfig.coinType].VAULT_ID,
        MMT_TYPE_CONFIG[coinConfig.coinType].POOL_ID,
        coinConfig.syStateId,
        coinConfig.pyStateId,
        coinConfig.marketFactoryConfigId,
        coinConfig.marketStateId,
        PYTH_ORACLE_MAP[MMT_TYPE_CONFIG[coinConfig.coinType].COIN_B_TYPE].priceInfoObjectId,
      ]);
      const versionList = objects.map((obj) => obj.data.owner.Shared.initial_shared_version)
      // console.log('objects', JSON.stringify(objects), JSON.stringify(versionList));

      const kind = generateMutiMoveCallKind(
        [
          MMT.MMT_ORACLE_ID,
          MMT.REGISTRY_ID,
          true,
          MMT.ORACLE_STATE,
          PYTH_ORACLE_MAP[MMT_TYPE_CONFIG[coinConfig.coinType].COIN_A_TYPE].priceInfoObjectId,
          MMT.SET_PRICE_CAP_REGISTRY,
          MMT.CLOCK_ADDRESS,
          coinConfig.priceOracleConfigId,
          coinConfig.oracleTicket,
          MMT_TYPE_CONFIG[coinConfig.coinType].VAULT_ID,
          MMT_TYPE_CONFIG[coinConfig.coinType].POOL_ID,
          coinConfig.syStateId,
          1000000,
          0,
          coinConfig.pyStateId,
          coinConfig.marketFactoryConfigId,
          coinConfig.marketStateId,
          PYTH_ORACLE_MAP[MMT_TYPE_CONFIG[coinConfig.coinType].COIN_B_TYPE].priceInfoObjectId,
        ],
        versionList,
        [
          true, false, false, false, false, false, true, false, false, false, false, true, false, true, false
        ],
        [
          {
            packageId: MMT.MMT_ORACLE_PACKAGE_ID,
            moduleName: 'oracle',
            functionName: 'get_price_receipt',
            typeArgs: [
              MMT_TYPE_CONFIG[coinConfig.coinType].COIN_A_TYPE,
            ],
            argCursors:[{"Input": 0}]
          },
          {
            packageId: MMT.PRICE_ADAPTER_PACKAGE_ID,
            moduleName: 'price_source',
            functionName: 'set_k_oracle_price',
            typeArgs: [
              MMT_TYPE_CONFIG[coinConfig.coinType].COIN_A_TYPE,
            ],
            argCursors:[{"Result": 0}, {"Input": 0}, {"Input": 1}, {"Input": 2}, {"Input": 3}, {"Input": 4}, {"Input": 5}, {"Input": 6}]
          },
          {
            packageId: MMT.MMT_ORACLE_PACKAGE_ID,
            moduleName: 'oracle',
            functionName: 'update_price',
            typeArgs: [
              MMT_TYPE_CONFIG[coinConfig.coinType].COIN_A_TYPE,
            ],
            argCursors:[{"Result": 0}, {"Input": 0}]
          },
          {
            packageId: MMT.MMT_ORACLE_PACKAGE_ID,
            moduleName: 'oracle',
            functionName: 'get_price_receipt',
            typeArgs: [
              MMT_TYPE_CONFIG[coinConfig.coinType].COIN_B_TYPE,
            ],
            argCursors:[{"Input": 0}]
          },
          {
            packageId: MMT.PRICE_ADAPTER_PACKAGE_ID,
            moduleName: 'price_source',
            functionName: 'set_k_oracle_price',
            typeArgs: [
              MMT_TYPE_CONFIG[coinConfig.coinType].COIN_B_TYPE,
            ],
            argCursors:[{"Result": 3}, {"Input": 0}, {"Input": 1}, {"Input": 2}, {"Input": 3}, {"Input": 17}, {"Input": 5}, {"Input": 6}]
          },
          {
            packageId: MMT.MMT_ORACLE_PACKAGE_ID,
            moduleName: 'oracle',
            functionName: 'update_price',
            typeArgs: [
              MMT_TYPE_CONFIG[coinConfig.coinType].COIN_B_TYPE,
            ],
            argCursors:[{"Result": 3}, {"Input": 0}]
          },
          {
            packageId: coinConfig.oraclePackageId,
            moduleName: 'vault',
            functionName: 'get_pair_price_voucher_usd_from_mmt_vault',
            typeArgs: [
              coinConfig.syCoinType,
              MMT_TYPE_CONFIG[coinConfig.coinType].COIN_A_TYPE,
              MMT_TYPE_CONFIG[coinConfig.coinType].COIN_B_TYPE,
              coinConfig.coinType,
              MMT_TYPE_CONFIG[coinConfig.coinType].CONFIG_TYPE,
            ],
            argCursors:[{"Input": 7}, {"Input": 8}, {"Input": 0}, {"Input": 9}, {"Input": 10}, {"Input": 11}, {"Input": 6}]
          },
          {
            packageId: '0x0f286ad004ea93ea6ad3a953b5d4f3c7306378b0dcc354c3f4ebb1d506d3b47f',
            moduleName: 'router',
            functionName: 'get_pt_out_for_exact_sy_in_with_price_voucher',
            typeArgs: [
              coinConfig.syCoinType
            ],
            argCursors:[
              {"Input": 12}, {"Input": 13}, {"Result": 6}, {"Input": 14}, {"Input": 15}, {"Input": 16}, {"Input": 6}
            ]
          }
        ]
      );
      // console.log('generateMutiMoveCallKind kind:', JSON.stringify(kind));
      return generateTxBytes(kind, 0);
  }
}

async function getOptimalSwapAmountForSingleSidedLiquidity(coinConfig) {
  const vault = MMT_TYPE_CONFIG[coinConfig.coinType];
  const objects = await getObjects([
    vault.VAULT_ID,
    vault.POOL_ID,
  ]);
  const versionList = objects.map((obj) => obj.data.owner.Shared.initial_shared_version)
  // console.log('objects', JSON.stringify(objects), JSON.stringify(versionList));

  const kind = generateKind(
    [
      vault.VAULT_ID,
      vault.POOL_ID,
      100000,
      false,
      20
    ],
    versionList,
    [false, false],
    VAULT_CONFIG.VAULT_PACKAGE_ID,
    'vault',
    'get_optimal_swap_amount_for_single_sided_liquidity',
    [
      vault.COIN_A_TYPE, vault.COIN_B_TYPE, coinConfig.coinType, vault.CONFIG_TYPE
    ],
  );

  // console.log('getOptimalSwapAmountForSingleSidedLiquidity kind', JSON.stringify(kind));
  return generateTxBytes(kind, 0);
}

async function getConversionRate(coinConfig) {
  const vault = MMT_TYPE_CONFIG[coinConfig.coinType];
  const objects = await getObjects([
    vault.VAULT_ID,
    vault.POOL_ID,
  ]);
  const versionList = objects.map((obj) => obj.data.owner.Shared.initial_shared_version)
  // console.log('objects', JSON.stringify(objects), JSON.stringify(versionList));

  const kind = generateKind(
    [
      vault.VAULT_ID,
      vault.POOL_ID,
      1000,
      false,
      20
    ],
    versionList,
    [false, false],
    VAULT_CONFIG.VAULT_PACKAGE_ID,
    'vault',
    'get_optimal_swap_amount_for_single_sided_liquidity',
    [
      vault.COIN_A_TYPE, vault.COIN_B_TYPE, coinConfig.coinType, vault.CONFIG_TYPE
    ],
  );

  // console.log('getOptimalSwapAmountForSingleSidedLiquidity kind', JSON.stringify(kind));
  return generateTxBytes(kind, 0);
}

function getScallopVersion(coinType) {
  if (coinType === '0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b::scallop_sui::SCALLOP_SUI') {
    return [497420735, 500867762, 7765848, 7765848, 497420736, 497676326, 497676325, 497676327, 1];
  } else if (coinType === '0x854950aa624b1df59fe64e630b2ba7c550642e9342267a33061d59fb31582da5::scallop_usdc::SCALLOP_USDC') {
    return [497420735, 500867764, 7765848, 7765848, 497420736, 497676328, 497676325, 497676329, 1]
  } else if (coinType === '0x5ca17430c1d046fae9edeaa8fd76c7b4193a00d764a0ecfa9418d733ad27bc1e::scallop_sca::SCALLOP_SCA') {
    return [497420735, 500867770, 7765848, 7765848, 497420736, 498188354, 497676325, 498188355, 1]
  } else if (coinType === '0xeb7a05a3224837c5e5503575aed0be73c091d1ce5e43aa3c3e716e0ae614608f::scallop_deep::SCALLOP_DEEP') {
    return [497420735, 500867768, 7765848, 7765848, 497420736, 498188356, 497676325, 498188357, 1]
  } else if (coinType === '0xb1d7df34829d1513b73ba17cb7ad90c88d1e104bb65ab8f62f13e0cc103783d3::scallop_sb_usdt::SCALLOP_SB_USDT') {
    return [497420735, 500867766, 7765848, 7765848, 497420736, 498193057, 497676325, 498193058, 1]
  } else if (coinType === '0xb14f82d8506d139eacef109688d1b71e7236bcce9b2c0ad526abcd6aa5be7de0::scallop_sb_eth::SCALLOP_SB_ETH') {
    return [497420735, 500867772, 7765848, 7765848, 497420736, 498194214, 497676325, 498194215, 1]
  } else if (coinType === '0xd285cbbf54c87fd93cd15227547467bb3e405da8bbf2ab99f83f323f88ac9a65::scallop_usdy::SCALLOP_USDY') {
    return [497420735, 506197597, 7765848, 7765848, 497420736, 506197598, 497676325, 506197599, 1]
  } else if (coinType === '0x0a228d1c59071eccf3716076a1f71216846ee256d9fb07ea11fb7c1eb56435a5::scallop_musd::SCALLOP_MUSD') {
    return [497420735, 506778303, 7765848, 7765848, 497420736, 506803339, 497676325, 506803340, 1]
  } else if (coinType === '0x622345b3f80ea5947567760eec7b9639d0582adcfd6ab9fccb85437aeda7c0d0::scallop_wal::SCALLOP_WAL') {
    return [497420735, 510640750, 7765848, 7765848, 497420736, 560611884, 497676325, 560611885, 1]
  }
  return [0, 0, 0, 0, 0]
}

function getBlizzardVersion(coinType) {
  if (coinType === '0xb1b0650a8862e30e3f604fd6c5838bc25464b8d3d827fbd58af7cb9685b832bf::wwal::WWAL') {
    return [497420735, 528577114, 511181119, 317862159, 497420736, 528577115, 497676325, 528577116, 1];
  } else if (coinType === '0xd8b855d48fb4d8ffbb5c4a3ecac27b00f3712ce58626deb5a16a290e0c6edf84::nwal::NWAL') {
    return [497420735, 537544775, 512202210, 317862159, 497420736, 538539517, 497676325, 538539518, 1]
  }
  return [0, 0, 0, 0, 0]
}

function getSpringVersion(coinType) {
  if (coinType === '0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI') {
    return [497420735, 533135484, 409234967, 497420736, 560611887, 497676325, 560611888, 1];
  } else if (coinType === '0x922d15d7f55c13fd790f6e54397470ec592caa2b508df292a2e8553f3d3b274f::msui::MSUI') {
    return [497420735, 537544773, 414622371, 497420736, 560625918, 497676325, 560625919, 1];
  } else if (coinType === '0x502867b177303bf1bf226245fcdd3403c177e78d175a55a56c0602c7ff51c7fa::trevin_sui::TREVIN_SUI') {
    return [497420735, 537544769, 437950345, 497420736, 560625921, 497676325, 560625922, 1];
  } else if (coinType === '0x02358129a7d66f943786a10b518fdc79145f1fc8d23420d9948c4aeea190f603::fud_sui::FUD_SUI') {
    return [497420735, 537544771, 423864488, 497420736, 560625914, 497676325, 560625915, 1];
  } else if (coinType === '0x41ff228bfd566f0c707173ee6413962a77e3929588d010250e4e76f0d1cc0ad4::ksui::KSUI') {
    return [497420735, 537544767, 430422182, 497420736, 560625916, 497676325, 560625917, 1];
  } else if (coinType === '0x285b49635f4ed253967a2a4a5f0c5aea2cbd9dd0fc427b4086f3fad7ccef2c29::i_sui::I_SUI') {
    return [497420735, 537544765, 496024418, 497420736, 560625919, 497676325, 560625920, 1];
  }
  return [0, 0, 0, 0, 0, 0, 0]
}

function generateTxBytes(kind, argsNum) {
  argsNum = kind.ProgrammableTransaction.inputs.length;

  let bytes = [
    ProgrammableTransactionIndex,
    kind.ProgrammableTransaction.inputs.length,
  ];

  for (let i = 0; i < argsNum; i++) {
    if (kind.ProgrammableTransaction.inputs[i].Object) {
      bytes = bytes.concat([
        ObjectIndex,
        SharedObjectIndex,
        ...hexToBytes(kind.ProgrammableTransaction.inputs[i].Object.SharedObject.objectId),
        ...toU64(kind.ProgrammableTransaction.inputs[i].Object.SharedObject.initialSharedVersion),
        kind.ProgrammableTransaction.inputs[i].Object.SharedObject.mutable ? 1 : 0,
      ]);
    } else {
      if (kind.ProgrammableTransaction.inputs[i].Pure.u64 !== undefined) {
        bytes = bytes.concat([
          PureIndex,
          U64Index,
          ...toU64(kind.ProgrammableTransaction.inputs[i].Pure.u64.value)
        ]);
      } else {
        bytes = bytes.concat([
          PureIndex,
          BoolIndex,
          kind.ProgrammableTransaction.inputs[i].Pure.bool.value ? 1 : 0
        ]);
      }
    }
  }
  bytes = bytes.concat([kind.ProgrammableTransaction.commands.length])

  for (let i = 0; i < kind.ProgrammableTransaction.commands.length; i++) {
    const moduleArg = textToBytes(kind.ProgrammableTransaction.commands[i].MoveCall.module);
    const functionArg = textToBytes(kind.ProgrammableTransaction.commands[i].MoveCall.function);
    const typeArgs = kind.ProgrammableTransaction.commands[i].MoveCall.typeArguments.map(t => {
      const parsed = parseSuiAddress(t);
      return {
        address: parsed.address,
        module: parsed.module,
        name: parsed.name,
        typeParams: parsed.typeParams || []
      };
    });

    bytes = bytes.concat([
      MoveCallIndex,
      ...hexToBytes(kind.ProgrammableTransaction.commands[i].MoveCall.package),
      moduleArg.length,
      ...moduleArg,
      functionArg.length,
      ...functionArg,
    ]);

    bytes = bytes.concat([
      typeArgs.length,
    ]);

    for (const typeArg of typeArgs) {
      const typeModule = textToBytes(typeArg.module);
      const typeName = textToBytes(typeArg.name);

      bytes = bytes.concat([
        StructIndex,
        ...hexToBytes(typeArg.address),
        typeModule.length,
        ...typeModule,
        typeName.length,
        ...typeName,
        typeArg.typeParams.length,
      ]);
    }

    let argumentsLength = kind.ProgrammableTransaction.commands[i].MoveCall.arguments.length;
    bytes = bytes.concat([argumentsLength]);
    // console.log(`${JSON.stringify(kind.ProgrammableTransaction.commands[i].MoveCall)}`)
    for (let j = 0; j < argumentsLength; j++) {
      // console.log(`${JSON.stringify(kind.ProgrammableTransaction.commands[i].MoveCall.arguments[j])}`)
      if (kind.ProgrammableTransaction.commands[i].MoveCall.arguments[j].Input !== undefined) {
        // console.log(`${i}, ${j}, Input: ${kind.ProgrammableTransaction.commands[i].MoveCall.arguments[j].Input}`);
        bytes = bytes.concat([
          InputIndex,
          kind.ProgrammableTransaction.commands[i].MoveCall.arguments[j].Input,
          0
        ]);
      } else {
        // console.log(`${i}, ${j}, Result: ${kind.ProgrammableTransaction.commands[i].MoveCall.arguments[j].Result}`);
        bytes = bytes.concat([
          ResultIndex,
          kind.ProgrammableTransaction.commands[i].MoveCall.arguments[j].Result,
          0
        ]);
      }
    }
  }

  // console.log('Generated bytes:', JSON.stringify(bytes));
  return Uint8Array.from(bytes);
}

function generateKind(argArr, versionArr, mutableArr, packageId, moduleName, functionName, typeArgs, priceVoucherParam = null) {
  let inputs = [];
  let args = [];
  let moveCall = []

  let versionCursor = 0;
  let mutableCursor = 0;
  for (let i = 0; i < argArr.length; i++) {
    let objectId = argArr[i];
    let version = versionArr[versionCursor];
    let mutable = mutableArr[mutableCursor];
    if (typeof objectId === 'string') {
      inputs.push(
        {
          "Object": {
            "SharedObject": {
              "objectId": objectId,
              "initialSharedVersion": version,
              "mutable": mutable
            }
          },
        }
      )
      versionCursor++;
      mutableCursor++;
    } else if (typeof objectId === 'number') {
      inputs.push({"Pure": {"u64": {"value": objectId,}},})
    } else if (typeof objectId === 'boolean') {
      inputs.push({"Pure": {"bool": {"value": objectId,}},})
    }
    args.push(
      {
        "Input": i
      }
    )
  }
  moveCall.push(
    {
      "MoveCall": {
        "package": packageId,
        "module": moduleName,
        "function": functionName,
        "typeArguments": typeArgs,
        "arguments": args,
      }
    }
  );

  if (priceVoucherParam != null) {
    let length = argArr.length;
    inputs.push({"Pure": {"u64": {"value": priceVoucherParam.syAmount,}},})
    inputs.push({"Pure": {"u64": {"value": priceVoucherParam.minPtAmount,}},})
    inputs.push(
      {
        "Object": {
          "SharedObject": {
            "objectId": priceVoucherParam.objectId[0],
            "initialSharedVersion": priceVoucherParam.version[0],
            "mutable": true
          }
        },
      }
    )
    inputs.push(
      {
        "Object": {
          "SharedObject": {
            "objectId": priceVoucherParam.objectId[1],
            "initialSharedVersion": priceVoucherParam.version[1],
            "mutable": false
          }
        },
      }
    )
    inputs.push(
      {
        "Object": {
          "SharedObject": {
            "objectId": priceVoucherParam.objectId[2],
            "initialSharedVersion": priceVoucherParam.version[2],
            "mutable": true
          }
        },
      }
    )
    inputs.push(
      {
        "Object": {
          "SharedObject": {
            "objectId": priceVoucherParam.objectId[3],
            "initialSharedVersion": priceVoucherParam.version[3],
            "mutable": false
          }
        },
      }
    )

    moveCall.push(
      {
        "MoveCall": {
          "package": "0x0f286ad004ea93ea6ad3a953b5d4f3c7306378b0dcc354c3f4ebb1d506d3b47f",
          "module": "router",
          "function": "get_pt_out_for_exact_sy_in_with_price_voucher",
          "typeArguments": priceVoucherParam.typeArgs,
          "arguments": [
            {"Input": length},
            {"Input": length + 1},
            {"Result": 0},
            {"Input": length + 2},
            {"Input": length + 3},
            {"Input": length + 4},
            {"Input": length + 5},
          ],
        }
      }
    );
  }

  return {
    "ProgrammableTransaction": {
      "inputs": inputs,
      "commands": moveCall
    }
  };
}

function generateMutiMoveCallKind(argArr, versionArr, mutableArr, moveCalls, priceVoucherParam = null) {
  let inputs = [];
  let moveCall = []
  let argLength = 0;

  let versionCursor = 0;
  let mutableCursor = 0;

  for (let i = 0; i < argArr.length; i++) {
    let objectId = argArr[i];
    let version = versionArr[versionCursor];
    let mutable = mutableArr[mutableCursor];
    if (typeof objectId === 'string') {
      inputs.push(
        {
          "Object": {
            "SharedObject": {
              "objectId": objectId,
              "initialSharedVersion": version,
              "mutable": mutable
            }
          },
        }
      )
      versionCursor++;
      mutableCursor++;
    } else if (typeof objectId === 'number') {
      inputs.push({"Pure": {"u64": {"value": objectId,}},})
    } else if (typeof objectId === 'boolean') {
      inputs.push({"Pure": {"bool": {"value": objectId,}},})
    }

  }

  for (const moveCallElement of moveCalls) {
    const {packageId, moduleName, functionName, typeArgs, argCursors} = moveCallElement;
    argLength += argArr.length;

    moveCall.push(
      {
        "MoveCall": {
          "package": packageId,
          "module": moduleName,
          "function": functionName,
          "typeArguments": typeArgs,
          "arguments": argCursors,
        }
      }
    );
  }


  if (priceVoucherParam != null) {
    let length = argLength;
    inputs.push({"Pure": {"u64": {"value": priceVoucherParam.syAmount,}},})
    inputs.push({"Pure": {"u64": {"value": priceVoucherParam.minPtAmount,}},})
    inputs.push(
      {
        "Object": {
          "SharedObject": {
            "objectId": priceVoucherParam.objectId[0],
            "initialSharedVersion": priceVoucherParam.version[0],
            "mutable": true
          }
        },
      }
    )
    inputs.push(
      {
        "Object": {
          "SharedObject": {
            "objectId": priceVoucherParam.objectId[1],
            "initialSharedVersion": priceVoucherParam.version[1],
            "mutable": false
          }
        },
      }
    )
    inputs.push(
      {
        "Object": {
          "SharedObject": {
            "objectId": priceVoucherParam.objectId[2],
            "initialSharedVersion": priceVoucherParam.version[2],
            "mutable": true
          }
        },
      }
    )
    inputs.push(
      {
        "Object": {
          "SharedObject": {
            "objectId": priceVoucherParam.objectId[3],
            "initialSharedVersion": priceVoucherParam.version[3],
            "mutable": false
          }
        },
      }
    )

    moveCall.push(
      {
        "MoveCall": {
          "package": "0x0f286ad004ea93ea6ad3a953b5d4f3c7306378b0dcc354c3f4ebb1d506d3b47f",
          "module": "router",
          "function": "get_pt_out_for_exact_sy_in_with_price_voucher",
          "typeArguments": priceVoucherParam.typeArgs,
          "arguments": [
            {"Input": length},
            {"Input": length + 1},
            {"Result": 0},
            {"Input": length + 2},
            {"Input": length + 3},
            {"Input": length + 4},
            {"Input": length + 5},
          ],
        }
      }
    );
  }

  return {
    "ProgrammableTransaction": {
      "inputs": inputs,
      "commands": moveCall
    }
  };
}

module.exports = {
  getExchangeRate,
  getOptimalSwapAmountForSingleSidedLiquidity,
  generateKind,
  generateTxBytes
}