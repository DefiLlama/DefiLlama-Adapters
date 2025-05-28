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
const {textToBytes} = require("./bytes");
const {hexToBytes, toU64} = require("../allbridge-core/bytes");


const ProgrammableTransactionIndex = 0;
const ObjectIndex = 1;
const SharedObjectIndex = 1;
const MoveCallIndex = 0;
const StructIndex = 7;
const InputIndex = 1;

function parseSuiAddress(str) {
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

async function getScallopTokenExchangeRate(coinConfig) {
  // console.log('getScallopTokenExchangeRate', JSON.stringify(coinConfig))
  // const suiClient = new SuiClient({url: 'https://sui-mainnet.g.allthatnode.com/full/json_rpc/9c64c4d19bee4e338f68f47969c54da0'});
  // const tx_types = await suiClient.call("unsafe_moveCall", [
  //   "0x0000000000000000000000000000000000000000000000000000000000000001",
  //   '0x14c26838b7a307b81169eb7c20d9fd1adaf2de4f0e6ea7853a9c9689ba840567',
  //   "scallop",
  //   "get_scallop_token_exchange_rate",
  //   [coinConfig.syCoinType, coinConfig.underlyingCoinType],
  //   [
  //     coinConfig.priceOracleConfigId,
  //     coinConfig.oracleTicket,
  //     coinConfig.providerVersion,
  //     coinConfig.providerMarket,
  //     coinConfig.syStateId,
  //     coinConfig.pyStateId,
  //     coinConfig.marketFactoryConfigId,
  //     coinConfig.marketStateId,
  //     "0x6"
  //   ],
  //   null, '100000000', "DevInspect"
  // ]);
  //
  // console.log('tx_types', tx_types)
  //
  // const devInsRes = await suiClient.dryRunTransactionBlock({
  //   transactionBlock: tx_types.txBytes
  // });
  //
  // console.log('get_scallop_token_exchange_rate devInsRes', JSON.stringify(devInsRes));
  // return ;


  let scallopVersion = getScallopVersion(coinConfig.coinType);

  const kind = {
    "ProgrammableTransaction": {
      "inputs": [
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.priceOracleConfigId,
              "initialSharedVersion": scallopVersion[0],
              "mutable": true
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.oracleTicket,
              "initialSharedVersion": scallopVersion[1],
              "mutable": false
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.providerVersion,
              "initialSharedVersion": scallopVersion[2],
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.providerMarket,
              "initialSharedVersion": scallopVersion[3],
              "mutable": true,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.syStateId,
              "initialSharedVersion": scallopVersion[4],
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.pyStateId,
              "initialSharedVersion": scallopVersion[5],
              "mutable": true,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.marketFactoryConfigId,
              "initialSharedVersion": scallopVersion[6],
              "mutable": false,
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.marketStateId,
              "initialSharedVersion": scallopVersion[7],
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
          "package": "0x14c26838b7a307b81169eb7c20d9fd1adaf2de4f0e6ea7853a9c9689ba840567",
          "module": "scallop",
          "function": "get_scallop_token_exchange_rate",
          "typeArguments": [coinConfig.syCoinType, coinConfig.underlyingCoinType],
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

  return generateTxBytes9Args(kind);
}

async function getPriceVoucher(coinConfig) {
  if (coinConfig.provider === "SpringSui") {
    const lstInfo = SPRING_SUI_STAKING_INFO_LIST.find(
      (item) => item.coinType === coinConfig.coinType,
    )?.value

    if (!lstInfo) {
      throw new Error(`SpringSui: lstInfo not found for ${coinConfig.coinType}`)
    }

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
                "initialSharedVersion": 533135484,
                "mutable": false
              }
            },
          },
          {
            "Object": {
              "SharedObject": {
                "objectId": lstInfo,
                "initialSharedVersion": 409234967,
                "mutable": false,
              }
            },
          },
          {
            "Object": {
              "SharedObject": {
                "objectId": coinConfig.syStateId,
                "initialSharedVersion": 497420736,
                "mutable": false
              }
            },
          }
        ],
        "commands": [
          {
            "MoveCall": {
              "package": coinConfig.oraclePackageId,
              "module": "spring",
              "function": "get_price_voucher_from_spring",
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
                }
              ],
            }
          }
        ]
      }
    };

    return generateTxBytes4Args(kind);
  } else if (coinConfig.provider === "Winter") {
    const blizzardStaking = Winter_Blizzard_Staking_List.find(
      (item) => item.coinType === coinConfig.coinType,
    )?.value

    if (!blizzardStaking) {
      throw new Error("Winter blizzard staking not found")
    }

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
                "initialSharedVersion": 528577114,
                "mutable": false
              }
            },
          },
          {
            "Object": {
              "SharedObject": {
                "objectId": blizzardStaking,
                "initialSharedVersion": 511181119,
                "mutable": true,
              }
            },
          },
          {
            "Object": {
              "SharedObject": {
                "objectId": WWAL.WALRUS_STAKING,
                "initialSharedVersion": 317862159,
                "mutable": false
              }
            },
          },
          {
            "Object": {
              "SharedObject": {
                "objectId": coinConfig.syStateId,
                "initialSharedVersion": 497420736,
                "mutable": false
              }
            },
          }
        ],
        "commands": [{
          "MoveCall": {
            "package": coinConfig.oraclePackageId,
            "module": "haedal",
            "function": "get_price_voucher_from_blizzard",
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
              }
            ],
          }
        }]
      }
    };

    return generateTxBytes5Args(kind);
  }
  switch (coinConfig.coinType) {
    case "0x8b4d553839b219c3fd47608a0cc3d5fcc572cb25d41b7df3833208586a8d2470::hawal::HAWAL": {
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
                  "objectId": "0x9e5f6537be1a5b658ec7eed23160df0b28c799563f6c41e9becc9ad633cb592b",
                  "initialSharedVersion": 510164128,
                  "mutable": false,
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": coinConfig.syStateId,
                  "initialSharedVersion": 497420736,
                  "mutable": false
                }
              },
            }
          ],
          "commands": [{
            "MoveCall": {
              "package": coinConfig.oraclePackageId,
              "module": "haedal",
              "function": "get_haWAL_price_voucher",
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
                }
              ],
            }
          }]
        }
      };

      return generateTxBytes4Args(kind);
    }
    case "0x828b452d2aa239d48e4120c24f4a59f451b8cd8ac76706129f4ac3bd78ac8809::lp_token::LP_TOKEN": {
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
                  "initialSharedVersion": 531031505,
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
                  "objectId": "0xde97452e63505df696440f86f0b805263d8659b77b8c316739106009d514c270",
                  "initialSharedVersion": 72475218,
                  "mutable": false,
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": "0x871d8a227114f375170f149f7e9d45be822dd003eba225e83c05ac80828596bc",
                  "initialSharedVersion": 29297877,
                  "mutable": false,
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": coinConfig.syStateId,
                  "initialSharedVersion": 497420736,
                  "mutable": false
                }
              },
            }
          ],
          "commands": [{
            "MoveCall": {
              "package": coinConfig.oraclePackageId,
              "module": "haedal",
              "function": "get_price_voucher_from_cetus_vault",
              "typeArguments": [coinConfig.syCoinType, coinConfig.yieldTokenType, coinConfig.coinType],
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
                }
              ],
            }
          }]
        }
      };

      return generateTxBytes6Args(kind);
    }
    case "0xd01d27939064d79e4ae1179cd11cfeeff23943f32b1a842ea1a1e15a0045d77d::st_sbuck::ST_SBUCK": {
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
                  "initialSharedVersion": 497420765,
                  "mutable": false
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": SSBUCK.VAULT,
                  "initialSharedVersion": 261896418,
                  "mutable": false,
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
              "package": coinConfig.oraclePackageId,
              "module": "buck",
              "function": "get_price_voucher_from_ssbuck",
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
                }
              ],
            }
          }]
        }
      };

      return generateTxBytes4Args(kind);
    }
    case "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT": {
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
                  "initialSharedVersion": 529022459,
                  "mutable": false
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": VOLO.NATIVE_POOL,
                  "initialSharedVersion": 34377055,
                  "mutable": false,
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": VOLO.METADATA,
                  "initialSharedVersion": 34377055,
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
            }
          ],
          "commands": [{
            "MoveCall": {
              "package": coinConfig.oraclePackageId,
              "module": "volo",
              "function": "get_price_voucher_from_volo",
              "typeArguments": [coinConfig.syCoinType],
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
                }
              ],
            }
          }]
        }
      };

      return generateTxBytes5Args(kind);
    }
    case "0x790f258062909e3a0ffc78b3c53ac2f62d7084c3bab95644bdeb05add7250001::super_sui::SUPER_SUI": {
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
            }
          ],
          "commands": [{
            "MoveCall": {
              "package": coinConfig.oraclePackageId,
              "module": "aftermath",
              "function": "get_meta_coin_price_voucher",
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
                }
              ],
            }
          }]
        }
      };

      return generateTxBytes5Args(kind);
    }
    case "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI": {
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
                  "initialSharedVersion": 499209575,
                  "mutable": false
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": AFTERMATH.STAKED_SUI_VAULT,
                  "initialSharedVersion": 32696040,
                  "mutable": false,
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": AFTERMATH.SAFE,
                  "initialSharedVersion": 32347695,
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
            }
          ],
          "commands": [{
            "MoveCall": {
              "package": coinConfig.oraclePackageId,
              "module": "aftermath",
              "function": "get_price_voucher_from_aftermath",
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
                }
              ],
            }
          }]
        }
      };

      return generateTxBytes5Args(kind);
    }
    case "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI": {
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
            }
          ],
          "commands": [{
            "MoveCall": {
              "package": coinConfig.oraclePackageId,
              "module": "haedal",
              "function": "get_price_voucher_from_haSui",
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
                }
              ],
            }
          }]
        }
      };

      return generateTxBytes4Args(kind);
    }
    case "0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55::stsui::STSUI": {
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
                  "initialSharedVersion": 499650241,
                  "mutable": false
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": ALPAHFI.LIQUID_STAKING_INFO,
                  "initialSharedVersion": 443441850,
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
            }
          ],
          "commands": [{
            "MoveCall": {
              "package": coinConfig.oraclePackageId,
              "module": "alphafi",
              "function": "get_price_voucher_from_spring",
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
                }
              ],
            }
          }]
        }
      };

      return generateTxBytes4Args(kind);
    }
    case "0x0c8a5fcbe32b9fc88fe1d758d33dd32586143998f68656f43f3a6ced95ea4dc3::lp_token::LP_TOKEN": {
      // moveCall = {
      //   target: `${coinConfig.oraclePackageId}::aftermath::get_price_voucher_from_cetus_vault`,
      //   arguments: [
      //     {
      //       name: "price_oracle_config",
      //       value: coinConfig.priceOracleConfigId,
      //     },
      //     {
      //       name: "price_ticket_cap",
      //       value: coinConfig.oracleTicket,
      //     },
      //     {
      //       name: "stake_vault",
      //       value: AFTERMATH.STAKED_SUI_VAULT,
      //     },
      //     {
      //       name: "safe",
      //       value: AFTERMATH.SAFE,
      //     },
      //     {
      //       name: "vault",
      //       value:
      //         "0xff4cc0af0ad9d50d4a3264dfaafd534437d8b66c8ebe9f92b4c39d898d6870a3",
      //     },
      //     {
      //       name: "pool",
      //       value:
      //         "0xa528b26eae41bcfca488a9feaa3dca614b2a1d9b9b5c78c256918ced051d4c50",
      //     },
      //     {name: "sy_state", value: coinConfig.syStateId},
      //   ],
      //   typeArguments: [
      //     coinConfig.syCoinType,
      //     coinConfig.yieldTokenType,
      //     coinConfig.coinType,
      //   ],
      // }
      // const [priceVoucher] = tx.moveCall({
      //   target: moveCall.target,
      //   arguments: moveCall.arguments.map((arg) => tx.object(arg.value)),
      //   typeArguments: moveCall.typeArguments,
      // })
      return null
    }
    case "0xb490d6fa9ead588a9d72da07a02914da42f6b5b1339b8118a90011a42b67a44f::lp_token::LP_TOKEN": {
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
                  "initialSharedVersion": 508675819,
                  "mutable": false
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": VOLO.NATIVE_POOL,
                  "initialSharedVersion": 34377055,
                  "mutable": false,
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": VOLO.METADATA,
                  "initialSharedVersion": 34377055,
                  "mutable": false,
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": "0x5732b81e659bd2db47a5b55755743dde15be99490a39717abc80d62ec812bcb6",
                  "initialSharedVersion": 102259623,
                  "mutable": false,
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": "0x6c545e78638c8c1db7a48b282bb8ca79da107993fcb185f75cedc1f5adb2f535",
                  "initialSharedVersion": 34395748,
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
            }
          ],
          "commands": [{
            "MoveCall": {
              "package": coinConfig.oraclePackageId,
              "module": "volo",
              "function": "get_price_voucher_from_cetus_vault",
              "typeArguments": [coinConfig.syCoinType, coinConfig.yieldTokenType, coinConfig.coinType],
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
                }
              ],
            }
          }]
        }
      };

      return generateTxBytes7Args(kind);
    }
    default: {

      let scallopVersion = getScallopVersion(coinConfig.coinType);

      const kind = {
        "ProgrammableTransaction": {
          "inputs": [
            {
              "Object": {
                "SharedObject": {
                  "objectId": coinConfig.priceOracleConfigId,
                  "initialSharedVersion": scallopVersion[0],
                  "mutable": true
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": coinConfig.oracleTicket,
                  "initialSharedVersion": scallopVersion[1],
                  "mutable": false
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": coinConfig.providerVersion,
                  "initialSharedVersion": scallopVersion[2],
                  "mutable": false,
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": coinConfig.providerMarket,
                  "initialSharedVersion": scallopVersion[3],
                  "mutable": true,
                }
              },
            },
            {
              "Object": {
                "SharedObject": {
                  "objectId": coinConfig.syStateId,
                  "initialSharedVersion": scallopVersion[4],
                  "mutable": false,
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
              "package": coinConfig.oraclePackageId,
              "module": "scallop",
              "function": "get_price_voucher_from_x_oracle",
              "typeArguments": [coinConfig.syCoinType, coinConfig.underlyingCoinType],
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
                }
              ],
            }
          }]
        }
      };

      return generateTxBytes6Args(kind);
    }
  }
}

function getScallopVersion(coinType) {
  if (coinType === '0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b::scallop_sui::SCALLOP_SUI') {
    return [497420735, 500867762, 7765848, 7765848, 497420736, 497676326, 497676325, 497676327];
  } else if (coinType === '0x854950aa624b1df59fe64e630b2ba7c550642e9342267a33061d59fb31582da5::scallop_usdc::SCALLOP_USDC') {
    return [497420735, 500867764, 7765848, 7765848, 497420736, 497676328, 497676325, 497676329]
  } else if (coinType === '0x5ca17430c1d046fae9edeaa8fd76c7b4193a00d764a0ecfa9418d733ad27bc1e::scallop_sca::SCALLOP_SCA') {
    return [497420735, 500867770, 7765848, 7765848, 497420736, 498188354, 497676325, 498188355]
  } else if (coinType === '0xeb7a05a3224837c5e5503575aed0be73c091d1ce5e43aa3c3e716e0ae614608f::scallop_deep::SCALLOP_DEEP') {
    return [497420735, 500867768, 7765848, 7765848, 497420736, 498188356, 497676325, 498188357]
  } else if (coinType === '0xb1d7df34829d1513b73ba17cb7ad90c88d1e104bb65ab8f62f13e0cc103783d3::scallop_sb_usdt::SCALLOP_SB_USDT') {
    return [497420735, 500867766, 7765848, 7765848, 497420736, 498193057, 497676325, 498193058]
  } else if (coinType === '0xb14f82d8506d139eacef109688d1b71e7236bcce9b2c0ad526abcd6aa5be7de0::scallop_sb_eth::SCALLOP_SB_ETH') {
    return [497420735, 500867772, 7765848, 7765848, 497420736, 498194214, 497676325, 498194215]
  } else if (coinType === '0xd285cbbf54c87fd93cd15227547467bb3e405da8bbf2ab99f83f323f88ac9a65::scallop_usdy::SCALLOP_USDY') {
    return [497420735, 506197597, 7765848, 7765848, 497420736, 506197598, 497676325, 506197599]
  } else if (coinType === '0x0a228d1c59071eccf3716076a1f71216846ee256d9fb07ea11fb7c1eb56435a5::scallop_musd::SCALLOP_MUSD') {
    return [497420735, 506778303, 7765848, 7765848, 497420736, 506803339, 497676325, 506803340]
  } else if (coinType === '0x622345b3f80ea5947567760eec7b9639d0582adcfd6ab9fccb85437aeda7c0d0::scallop_wal::SCALLOP_WAL') {
    return [497420735, 510640750, 7765848, 7765848, 497420736, 560611884, 497676325, 560611885]
  }
  return [0, 0, 0, 0, 0]
}


function getPtOutForExactSyInWithPriceVoucher(syAmount, priceVoucher, coinConfig) {
  const kind = {
    "ProgrammableTransaction": {
      "inputs": [
        {
          "Pure": {
            "U64": {
              "value": coinConfig.priceOracleConfigId
            }
          },
        },
        {
          "Pure": {
            "U64": {
              "value": coinConfig.priceOracleConfigId
            }
          },
        },
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
              "initialSharedVersion": 533135484,
              "mutable": false
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": lstInfo,
              "initialSharedVersion": 409234967,
              "mutable": false
            }
          },
        },
        {
          "Object": {
            "SharedObject": {
              "objectId": coinConfig.syStateId,
              "initialSharedVersion": 497420736,
              "mutable": false
            }
          },
        }
      ],
      "commands": [{
        "MoveCall": {
          "package": coinConfig.oraclePackageId,
          "module": "spring",
          "function": "get_price_voucher_from_spring",
          "typeArguments": [coinConfig.syCoinType, coinConfig.coinType],
          "arguments": [{
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
            }
          ],
        }
      }]
    }
  };

  const moduleArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.module);
  const functionArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.function);

  const typeArgs = kind.ProgrammableTransaction.commands[0].MoveCall.typeArguments.map(t => {
    const parsed = parseSuiAddress(t);
    return {
      address: parsed.address,
      module: parsed.module,
      name: parsed.name,
      typeParams: parsed.typeParams || []
    };
  });

  let bytes = [
    ProgrammableTransactionIndex,
    kind.ProgrammableTransaction.inputs.length,
  ];

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[0].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[1].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[2].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[3].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands.length,
    MoveCallIndex,
    ...hexToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.package),
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
  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments.length,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[0].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[1].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[2].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[3].Input,
    0,
  ]);
  return Uint8Array.from(bytes);
}

function generate2CallTxBytes10Args(kind) {
  const moduleArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.module);
  const functionArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.function);

  const moduleArg1 = textToBytes(kind.ProgrammableTransaction.commands[1].MoveCall.module);
  const functionArg1 = textToBytes(kind.ProgrammableTransaction.commands[1].MoveCall.function);

  const typeArgs = kind.ProgrammableTransaction.commands[0].MoveCall.typeArguments.map(t => {
    const parsed = parseSuiAddress(t);
    return {
      address: parsed.address,
      module: parsed.module,
      name: parsed.name,
      typeParams: parsed.typeParams || []
    };
  });

  const typeArgs1 = kind.ProgrammableTransaction.commands[1].MoveCall.typeArguments.map(t => {
    const parsed = parseSuiAddress(t);
    return {
      address: parsed.address,
      module: parsed.module,
      name: parsed.name,
      typeParams: parsed.typeParams || []
    };
  });

  let bytes = [
    ProgrammableTransactionIndex,
    kind.ProgrammableTransaction.inputs.length,
  ];

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[0].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[1].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[2].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[3].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...toU64(kind.ProgrammableTransaction.inputs[4].Pure.u64.value),
    // ...toU64(kind.ProgrammableTransaction.inputs[4].Object.SharedObject.initialSharedVersion),
    // kind.ProgrammableTransaction.inputs[4].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...toU64(kind.ProgrammableTransaction.inputs[5].Pure.u64.value),
    // ...toU64(kind.ProgrammableTransaction.inputs[5].Object.SharedObject.initialSharedVersion),
    // kind.ProgrammableTransaction.inputs[5].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[6].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[6].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[6].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[7].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[7].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[7].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[8].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[8].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[8].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[9].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[9].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[9].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands.length,
    MoveCallIndex,
    ...hexToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.package),
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
  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments.length,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[0].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[1].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[2].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[3].Input,
    0,
  ]);

  bytes = bytes.concat([
    MoveCallIndex,
    ...hexToBytes(kind.ProgrammableTransaction.commands[1].MoveCall.package),
    moduleArg1.length,
    ...moduleArg1,
    functionArg1.length,
    ...functionArg1,
  ]);

  bytes = bytes.concat([
    typeArgs1.length,
  ]);

  for (const typeArg of typeArgs1) {
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
  bytes = bytes.concat([
    InputIndex,
    kind.ProgrammableTransaction.commands[1].MoveCall.arguments[0].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[1].MoveCall.arguments[1].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[1].MoveCall.arguments[2].NestedResult,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[1].MoveCall.arguments[3].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[1].MoveCall.arguments[4].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[1].MoveCall.arguments[5].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[1].MoveCall.arguments[6].Input,
    0,
  ]);
  return Uint8Array.from(bytes);
}

function generateTxBytes4Args(kind) {
  const moduleArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.module);
  const functionArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.function);

  const typeArgs = kind.ProgrammableTransaction.commands[0].MoveCall.typeArguments.map(t => {
    const parsed = parseSuiAddress(t);
    return {
      address: parsed.address,
      module: parsed.module,
      name: parsed.name,
      typeParams: parsed.typeParams || []
    };
  });

  let bytes = [
    ProgrammableTransactionIndex,
    kind.ProgrammableTransaction.inputs.length,
  ];

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[0].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[1].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[2].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[3].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands.length,
    MoveCallIndex,
    ...hexToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.package),
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
  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments.length,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[0].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[1].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[2].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[3].Input,
    0,
  ]);
  return Uint8Array.from(bytes);
}

function generateTxBytes5Args(kind) {
  const moduleArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.module);
  const functionArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.function);

  const typeArgs = kind.ProgrammableTransaction.commands[0].MoveCall.typeArguments.map(t => {
    const parsed = parseSuiAddress(t);
    return {
      address: parsed.address,
      module: parsed.module,
      name: parsed.name,
      typeParams: parsed.typeParams || []
    };
  });

  let bytes = [
    ProgrammableTransactionIndex,
    kind.ProgrammableTransaction.inputs.length,
  ];

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[0].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[1].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[2].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[3].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[4].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[4].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[4].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands.length,
    MoveCallIndex,
    ...hexToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.package),
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
  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments.length,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[0].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[1].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[2].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[3].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[4].Input,
    0,
  ]);
  return Uint8Array.from(bytes);
}

function generateTxBytes6Args(kind) {
  const moduleArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.module);
  const functionArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.function);

  const typeArgs = kind.ProgrammableTransaction.commands[0].MoveCall.typeArguments.map(t => {
    const parsed = parseSuiAddress(t);
    return {
      address: parsed.address,
      module: parsed.module,
      name: parsed.name,
      typeParams: parsed.typeParams || []
    };
  });

  let bytes = [
    ProgrammableTransactionIndex,
    kind.ProgrammableTransaction.inputs.length,
  ];

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[0].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[1].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[2].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[3].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[4].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[4].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[4].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[5].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[5].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[5].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands.length,
    MoveCallIndex,
    ...hexToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.package),
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
  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments.length,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[0].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[1].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[2].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[3].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[4].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[5].Input,
    0,
  ]);
  return Uint8Array.from(bytes);
}

function generateTxBytes7Args(kind) {
  const moduleArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.module);
  const functionArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.function);

  const typeArgs = kind.ProgrammableTransaction.commands[0].MoveCall.typeArguments.map(t => {
    const parsed = parseSuiAddress(t);
    return {
      address: parsed.address,
      module: parsed.module,
      name: parsed.name,
      typeParams: parsed.typeParams || []
    };
  });

  let bytes = [
    ProgrammableTransactionIndex,
    kind.ProgrammableTransaction.inputs.length,
  ];

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[0].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[1].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[2].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[3].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[4].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[4].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[4].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[5].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[5].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[5].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[6].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[6].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[6].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands.length,
    MoveCallIndex,
    ...hexToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.package),
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
  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments.length,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[0].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[1].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[2].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[3].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[4].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[5].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[6].Input,
    0,
  ]);
  return Uint8Array.from(bytes);
}

function generateTxBytes9Args(kind) {
  const moduleArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.module);
  const functionArg = textToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.function);

  const typeArgs = kind.ProgrammableTransaction.commands[0].MoveCall.typeArguments.map(t => {
    const parsed = parseSuiAddress(t);
    return {
      address: parsed.address,
      module: parsed.module,
      name: parsed.name,
      typeParams: parsed.typeParams || []
    };
  });

  let bytes = [
    ProgrammableTransactionIndex,
    kind.ProgrammableTransaction.inputs.length,
  ];

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[0].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[0].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[1].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[1].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[2].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[2].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[3].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[3].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[4].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[4].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[4].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[5].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[5].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[5].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[6].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[6].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[6].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[7].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[7].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[7].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    ObjectIndex,
    SharedObjectIndex,
    ...hexToBytes(kind.ProgrammableTransaction.inputs[8].Object.SharedObject.objectId),
    ...toU64(kind.ProgrammableTransaction.inputs[8].Object.SharedObject.initialSharedVersion),
    kind.ProgrammableTransaction.inputs[8].Object.SharedObject.mutable ? 1 : 0,
  ]);

  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands.length,
    MoveCallIndex,
    ...hexToBytes(kind.ProgrammableTransaction.commands[0].MoveCall.package),
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
  bytes = bytes.concat([
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments.length,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[0].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[1].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[2].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[3].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[4].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[5].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[6].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[7].Input,
    0,
    InputIndex,
    kind.ProgrammableTransaction.commands[0].MoveCall.arguments[8].Input,
    0,
  ]);
  return Uint8Array.from(bytes);
}

module.exports = {
  getScallopTokenExchangeRate,
}