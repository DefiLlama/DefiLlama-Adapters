const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  ethereum: {
    tvl: {
      pools: [
        {
          pool: '0x1116898dda4015ed8ddefb84b6e8bc24528af2d8',
          tokens: [
            ADDRESSES.ethereum.DAI,
            ADDRESSES.ethereum.USDC,
            ADDRESSES.ethereum.USDT,
          ]
        },
      ],
      bridge: {
        address: '0x2796317b0fF8538F253012862c06787Adfb8cEb6',
        tokens: [
          '0x98585dfc8d9e7d48f0b1ae47ce33332cf4237d96', // NEWO
          ADDRESSES.ethereum.WETH,
          '0x0ab87046fBb341D058F17CBC4c1133F25a20a52f', // gOHM
          '0x71ab77b7dbb4fa7e017bc15090b2163221420282', // HIGH
          ADDRESSES.ethereum.FRAX,
          '0xbaac2b4491727d78d2b78815144570b9f2fe8899', // DOG
          '0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f', // SDT
          ADDRESSES.ethereum.USDC,
          ADDRESSES.ethereum.USDT,
          '0xb753428af26e81097e7fd17f40c88aaa3e04902c', // SFI
          ADDRESSES.ethereum.DAI,
          ADDRESSES.ethereum.WBTC,
          '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8', // agEUR
          '0x0642026E7f0B6cCaC5925b4E7Fa61384250e1701', // H2O
          '0x02B5453D92B730F29a86A0D5ef6e930c4Cf8860B', // USDB 
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
            ADDRESSES.optimism.WETH,
          ]
        },
        {
          pool: '0xF44938b0125A6662f9536281aD2CD6c499F22004',
          tokens: [
            // ADDRESSES.metis.SYN, // nusd
            ADDRESSES.optimism.USDC,
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
          ADDRESSES.avax.WAVAX,
          '0x1f1e7c893855525b303f99bdf5c3c05be09ca251', // SYN
          '0x321E7092a180BB43555132ec53AaA65a5bF84251', // gOHM
          ADDRESSES.avax.BTC_b,
          '0x5aB7084CB9d270c2Cb052dd30dbecBCA42F8620c', // USDB
          '0x62edc0692BD897D2295872a9FFCac5425011c661', // GMX
        ]
      },
      pools: [
        {
          pool: '0xED2a7edd7413021d440b09D654f3b87712abAB66',
          tokens: [
            ADDRESSES.avax.DAI,
            ADDRESSES.avax.USDC_e,
            ADDRESSES.avax.USDT_e,
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
            ADDRESSES.cronos.USDC,
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
          '0x5f4bde007dc06b867f86ebfe4802e34a1ffeed63', // HIGH
          '0xaA88C603d142C371eA0eAC8756123c5805EdeE03', // DOG
          ADDRESSES.bsc.BUSD,
          '0x0FE9778c005a5A6115cBE12b0568a2d50b765A51', // NFD
          '0x130025eE738A66E691E6A7a62381CB33c6d9Ae83', // JUMP
          '0xc8699AbBba90C7479dedcCEF19eF78969a2fc608', // USDB
        ]
      },
      pools: [
        {
          pool: '0x28ec0B36F0819ecB5005cAB836F4ED5a2eCa4D13',
          tokens: [
            ADDRESSES.bsc.BUSD,
            ADDRESSES.bsc.USDC,
            ADDRESSES.bsc.USDT,
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
            '0xd8cA34fd379d9ca3C6Ee3b3905678320F5b45195', // gOHM
            ADDRESSES.polygon.WMATIC_2,
        ]
      },
      pools: [
        {
          pool: '0x85fCD7Dd0a1e1A9FCD5FD886ED522dE8221C3EE5',
          tokens: [
            ADDRESSES.polygon.DAI,
            ADDRESSES.polygon.USDC,
            ADDRESSES.polygon.USDT,
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
        tokens: [
          '0x91fa20244Fb509e8289CA630E5db3E9166233FDc', // gOHM
          ADDRESSES.fantom.WFTM,
          '0x6Fc9383486c163fA48becdEC79d6058f984f62cA', // USDB
        ]
      },
      pools: [
        {
          pool: '0x85662fd123280827e11c59973ac9fcbe838dc3b4',
          tokens: [
            ADDRESSES.fantom.USDC,
            ADDRESSES.fantom.fUSDT,
            // "0xED2a7edd7413021d440b09D654f3b87712abAB66", // nusd
          ]
        },
        {
          pool: ADDRESSES.arbitrum.nUSD,
          tokens: [
            ADDRESSES.fantom.MIM,
            ADDRESSES.fantom.USDC,
            ADDRESSES.fantom.fUSDT,
            // "0xED2a7edd7413021d440b09D654f3b87712abAB66", // nusd
          ]
        },
        {
          pool: '0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1',
          tokens: [
            "0x74b23882a30290451A17c44f4F05243b6b58C76d", // weth
            // ADDRESSES.metis.SYN, // neth
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
            ADDRESSES.boba.WETH,
            // "0x96419929d7949D6A801A6909c145C8EEf6A40431", // neth
          ]
        },
        {
          pool: '0x75FF037256b36F15919369AC58695550bE72fead',
          tokens: [
            ADDRESSES.boba.DAI,
            ADDRESSES.boba.USDC,
            ADDRESSES.boba.USDT,
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
            ADDRESSES.metis.WETH,
            // "0x931b8f17764362a3325d30681009f0edd6211231", // neth
          ]
        },
        {
          pool: '0x555982d2E211745b96736665e19D9308B615F78e',
          tokens: [
            ADDRESSES.metis.m_USDC,
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
          ADDRESSES.arbitrum.GMX,
        ]
      },
      pools: [
        {
          pool: '0xa067668661C84476aFcDc6fA5D758C4c01C34352',
          tokens: [
            ADDRESSES.arbitrum.WETH,
            // "0x3ea9b0ab55f34fb188824ee288ceaefc63cf908e", // neth
          ]
        },
        {
          pool: '0x9Dd329F5411466d9e0C488fF72519CA9fEf0cb40',
          tokens: [
            ADDRESSES.arbitrum.USDT,
            ADDRESSES.arbitrum.USDC,
            // ADDRESSES.arbitrum.nUSD, // nusd
          ]
        },
        {
          pool: '0x0Db3FE3B770c95A0B99D1Ed6F2627933466c0Dd8',
          tokens: [
            ADDRESSES.arbitrum.USDT,
            ADDRESSES.arbitrum.USDC,
            ADDRESSES.arbitrum.MIM,
            // ADDRESSES.arbitrum.nUSD, // nusd
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
            ADDRESSES.aurora.USDC_e,
            ADDRESSES.aurora.USDT_e,
            // ADDRESSES.aurora.nUSD, // nusd
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
          ADDRESSES.harmony.JEWEL,
          ADDRESSES.harmony.xJEWEL,
          '0x24eA0D436d3c2602fbfEfBe6a16bBc304C963D04', // DFKTEARS
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
          pool: ADDRESSES.arbitrum.nUSD,
          tokens: [
            "0x6983d1e6def3690c4d616b13597a09e6193ea013", // 1ETH
            // ADDRESSES.optimism.gOHM, // neth
          ]
        },
        {
          pool: '0x00A4F57D926781f62D09bb05ec76e6D8aE4268da',
          tokens: [
            ADDRESSES.harmony.AVAX,
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
          '0x98878B06940aE243284CA214f92Bb71a2b032B8A', // wMOVR
        ]
      },
    }
  },
  moonbeam: {
    tvl: {
      bridge: {
        address: '0x84A420459cd31C3c34583F67E0f0fB191067D32f',
        tokens: [
          '0x0db6729c03c85b0708166ca92801bcb5cac781fc', // veSOLAR
        ]
      },
    }
  },
    canto: {
    tvl: {
      bridge: {
        address: '0xDde5BEC4815E1CeCf336fb973Ca578e8D83606E0',
        tokens: [
        ]
      },
      pools: [
        {
          pool: ADDRESSES.aurora.nUSD,
          tokens: [
            ADDRESSES.canto.NOTE,
            // "0xd8836af2e565d3befce7d906af63ee45a57e8f80", // nUSD
          ]
        },
        {
          pool: '0x273508478e099Fdf953349e6B3704E7c3dEE91a5',
          tokens: [
            ADDRESSES.functionx.WFX,
            // "0xd8836af2e565d3befce7d906af63ee45a57e8f80", // nusd
          ]
        },
        {
          pool: '0xF60F88bA0CB381b8D8A662744fF93486273c22F9',
          tokens: [
            ADDRESSES.functionx.PURSE,
            // "0x09fec30669d63a13c666d2129230dd5588e2e240", // nETH
          ]
        },
      ]
    }
  },
  klaytn: {
    tvl: {
      bridge: {
        address: '0xaf41a65f786339e7911f4acdad6bd49426f2dc6b',
        tokens: [
          '0x5819b6af194a78511c79c85ea68d2377a7e9335f', // wKLAY
          '0xcd6f29dc9ca217d0973d3d21bf58edd3ca871a86', // wETH
          '0xdcbacf3f7a069922e677912998c8d57423c37dfa', // wBTC
          '0xd6dab4cff47df175349e6e7ee2bf7c40bb8c05a3', // USDT
          '0x6270b58be569a7c0b8f47594f191631ae5b2c86c', // USDC
          '0xdcbacf3f7a069922e677912998c8d57423c37dfa', // wBTC
        ]
      },
      pools: [
        {
          pool: '0xfdbad1699a550f933efebf652a735f2f89d3833c',
          tokens: [
            "0xd6dab4cff47df175349e6e7ee2bf7c40bb8c05a3", // USDT
            ADDRESSES.klaytn.oUSDT,
          ]
        },
      ]
    }
  },
}
