module.exports = {
  ethereum: {
    tvl: {
      pools: [
        {
          pool: '0x1116898dda4015ed8ddefb84b6e8bc24528af2d8',
          tokens: [
            "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
            "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
          ]
        },
      ],
      bridge: {
        address: '0x2796317b0fF8538F253012862c06787Adfb8cEb6',
        tokens: [
          '0x98585dfc8d9e7d48f0b1ae47ce33332cf4237d96', // NEWO
          '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
          '0x0ab87046fBb341D058F17CBC4c1133F25a20a52f', // gOHM
          '0x71ab77b7dbb4fa7e017bc15090b2163221420282', // HIGH
          '0x853d955acef822db058eb8505911ed77f175b99e', // FRAX
          '0xbaac2b4491727d78d2b78815144570b9f2fe8899', // DOG
          '0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f', // SDT
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
          '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
          '0xb753428af26e81097e7fd17f40c88aaa3e04902c', // SFI
          '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
          '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // wBTC
          '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8', // agEUR
          '0x0642026E7f0B6cCaC5925b4E7Fa61384250e1701', // H2O      
        ]
      }
    }
  },
  optimism: {
    tvl: {
      bridge: {
        address: '0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b',
        tokens: []
      },
      pools: [
        {
          pool: '0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9',
          tokens: [
            // '0x809DC529f07651bD43A172e8dB6f4a7a0d771036', // neth
            '0x121ab82b49B2BC4c7901CA46B8277962b4350204', // weth
          ]
        },
        {
          pool: '0xF44938b0125A6662f9536281aD2CD6c499F22004',
          tokens: [
            // '0x67C10C397dD0Ba417329543c1a40eb48AAa7cd00', // nusd
            '0x7f5c764cbc14f9669b88837ca1490cca17c31607', // usdc
          ]
        },
      ],
    }
  },
  avax: {
    tvl: {
      bridge: {
        address: '0xC05e61d0E7a63D27546389B7aD62FdFf5A91aACE',
        tokens: [
          '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
          '0x1f1e7c893855525b303f99bdf5c3c05be09ca251',
          '0x321E7092a180BB43555132ec53AaA65a5bF84251',
        ]
      },
      pools: [
        {
          pool: '0xED2a7edd7413021d440b09D654f3b87712abAB66',
          tokens: [
            "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", // DAI
            "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // USDC
            "0xc7198437980c041c805a1edcba50c1ce5db95118", // USDT
            // "0xCFc37A6AB183dd4aED08C204D1c2773c0b1BDf46", // nusd
          ]
        },
        {
          pool: '0x77a7e60555bC18B4Be44C181b2575eee46212d44',
          tokens: [
            "0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21", // awETH
            // "0x19e1ae0ee35c0404f835521146206595d37981ae", // nETH
          ]
        },
      ]
    }
  },
  cronos: {
    tvl: {
      bridge: {
        address: '0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9',
        tokens: []
      },
      pools: [
        {
          pool: '0xCb6674548586F20ca39C97A52A0ded86f48814De',
          tokens: [
            "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59", // DAI
            // "0x396c9c192dd323995346632581BEF92a31AC623b", // nusd
          ]
        },
      ]
    }
  },
  bsc: {
    tvl: {
      bridge: {
        address: '0xd123f70AE324d34A9E76b67a27bf77593bA8749f',
        tokens: [
          '0x5f4bde007dc06b867f86ebfe4802e34a1ffeed63',
          '0xa4080f1778e69467e905b8d6f72f6e441f9e9484',
        ]
      },
      pools: [
        {
          pool: '0x28ec0B36F0819ecB5005cAB836F4ED5a2eCa4D13',
          tokens: [
            "0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD
            "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
            "0x55d398326f99059ff775485246999027b3197955", // USDT
            // "0x23b891e5c62e0955ae2bd185990103928ab817b3", // nusd
          ]
        },
      ]
    }
  },
  polygon: {
    tvl: {
      bridge: {
        address: '0x8f5bbb2bb8c2ee94639e55d5f41de9b4839c1280',
        tokens: [
        ]
      },
      pools: [
        {
          pool: '0x85fCD7Dd0a1e1A9FCD5FD886ED522dE8221C3EE5',
          tokens: [
            "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // DAI
            "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
            "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
            // "0xb6c473756050de474286bed418b77aeac39b02af", // nusd
          ]
        },
      ]
    }
  },
  fantom: {
    tvl: {
      bridge: {
        address: '0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b',
        tokens: []
      },
      pools: [
        {
          pool: '0x85662fd123280827e11c59973ac9fcbe838dc3b4',
          tokens: [
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75", // USDC
            "0x049d68029688eabf473097a2fc38ef61633a3c7a", // fUSDT
            // "0xED2a7edd7413021d440b09D654f3b87712abAB66", // nusd
          ]
        },
        {
          pool: '0x2913E812Cf0dcCA30FB28E6Cac3d2DCFF4497688',
          tokens: [
            "0x82f0b8b456c1a451378467398982d4834b6829c1", // MIM
            "0x04068da6c83afcfa0e13ba15a6696662335d5b75", // USDC
            "0x049d68029688eabf473097a2fc38ef61633a3c7a", // USDT
            // "0xED2a7edd7413021d440b09D654f3b87712abAB66", // nusd
          ]
        },
        {
          pool: '0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1',
          tokens: [
            "0x74b23882a30290451A17c44f4F05243b6b58C76d", // weth
            // "0x67c10c397dd0ba417329543c1a40eb48aaa7cd00", // neth
          ]
        },
      ]
    }
  },
  boba: {
    tvl: {
      bridge: {
        address: '0x432036208d2717394d2614d6697c46DF3Ed69540',
        tokens: [
        ]
      },
      pools: [
        {
          pool: '0x753bb855c8fe814233d26Bb23aF61cb3d2022bE5',
          tokens: [
            "0xd203De32170130082896b4111eDF825a4774c18E", // weth
            // "0x96419929d7949D6A801A6909c145C8EEf6A40431", // neth
          ]
        },
        {
          pool: '0x75FF037256b36F15919369AC58695550bE72fead',
          tokens: [
            "0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35", // DAI
            "0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc", // USDC
            "0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d", // USDT
            // "0x6B4712AE9797C199edd44F897cA09BC57628a1CF", // nusd
          ]
        },
      ]
    }
  },
  metis: {
    tvl: {
      bridge: {
        address: '0x06Fea8513FF03a0d3f61324da709D4cf06F42A5c',
        tokens: [
          '0xe3c82a836ec85311a433fbd9486efaf4b1afbf48'
        ]
      },
      pools: [
        {
          pool: '0x09fec30669d63a13c666d2129230dd5588e2e240',
          tokens: [
            "0x420000000000000000000000000000000000000a", // weth
            // "0x931b8f17764362a3325d30681009f0edd6211231", // neth
          ]
        },
        {
          pool: '0x555982d2E211745b96736665e19D9308B615F78e',
          tokens: [
            "0xea32a96608495e54156ae48931a7c20f0dcc1a21", // USDC
            // "0x961318fc85475e125b99cc9215f62679ae5200ab", // nusd
          ]
        },
      ]
    }
  },
  arbitrum: {
    tvl: {
      bridge: {
        address: '0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9',
        tokens: [
          '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a',
        ]
      },
      pools: [
        {
          pool: '0xa067668661C84476aFcDc6fA5D758C4c01C34352',
          tokens: [
            "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // weth
            // "0x3ea9b0ab55f34fb188824ee288ceaefc63cf908e", // neth
          ]
        },
        {
          pool: '0x9Dd329F5411466d9e0C488fF72519CA9fEf0cb40',
          tokens: [
            "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
            "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
            // "0x2913e812cf0dcca30fb28e6cac3d2dcff4497688", // nusd
          ]
        },
        {
          pool: '0x0Db3FE3B770c95A0B99D1Ed6F2627933466c0Dd8',
          tokens: [
            "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
            "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
            "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a", // MIM
            // "0x2913e812cf0dcca30fb28e6cac3d2dcff4497688", // nusd
          ]
        },
      ]
    }
  },
  aurora: {
    tvl: {
      bridge: {
        address: '0xaeD5b25BE1c3163c907a471082640450F928DDFE',
        tokens: [
        ]
      },
      pools: [
        {
          pool: '0xcEf6C2e20898C2604886b888552CA6CcF66933B0',
          tokens: [
            "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802", // USDC
            "0x4988a896b1227218e4A686fdE5EabdcAbd91571f", // USDT
            // "0x07379565cD8B0CaE7c60Dc78e7f601b34AF2A21c", // nusd
          ]
        },
      ]
    }
  },
  harmony: {
    tvl: {
      bridge: {
        address: '0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b',
        tokens: [
          '0x72cb10c6bfa5624dd07ef608027e366bd690048f',
          '0xa9ce83507d872c5e1273e745abcfda849daa654f',
        ]
      },
      pools: [
        {
          pool: '0x3ea9B0ab55F34Fb188824Ee288CeaEfC63cf908e',
          tokens: [
            "0xef977d2f931c1978db5f6747666fa1eacb0d0339", // DAI
            "0x985458e523db3d53125813ed68c274899e9dfab4", // USDC
            "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f", // USDT
            // "0xED2a7edd7413021d440b09D654f3b87712abAB66", // nusd
          ]
        },
        {
          pool: '0x2913E812Cf0dcCA30FB28E6Cac3d2DCFF4497688',
          tokens: [
            "0x6983d1e6def3690c4d616b13597a09e6193ea013", // 1ETH
            // "0x0b5740c6b4a97f90ef2f0220651cca420b868ffb", // neth
          ]
        },
        {
          pool: '0x00A4F57D926781f62D09bb05ec76e6D8aE4268da',
          tokens: [
            "0xb12c13e66ade1f72f71834f2fc5082db8c091358", // avax
            // "???", // synAvax
          ]
        },
      ]
    }
  },
  moonriver: {
    tvl: {
      bridge: {
        address: '0xaeD5b25BE1c3163c907a471082640450F928DDFE',
        tokens: [
          '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
        ]
      },
    }
  },
  moonbeam: {
    tvl: {
      bridge: {
        address: '0x84A420459cd31C3c34583F67E0f0fB191067D32f',
        tokens: [
          '0x0db6729c03c85b0708166ca92801bcb5cac781fc',
        ]
      },
    }
  },
  klaytn: {
    tvl: {
      bridge: {
        address: '0xaf41a65f786339e7911f4acdad6bd49426f2dc6b',
        tokens: [
        ]
      },
      pools: [
        {
          pool: '0xfdbad1699a550f933efebf652a735f2f89d3833c',
          tokens: [
            "0xd6dab4cff47df175349e6e7ee2bf7c40bb8c05a3", // USDT
            "0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167", // o.USDT
          ]
        },
      ]
    }
  },
}
