const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const chains = {
  ethereum: {
    tokens: {
      FOX: "0xc770eefad204b5180df6a14ee197d99d808ee52d",
      tFOX: "0x808D3E6b23516967ceAE4f17a5F9038383ED5311",
      ETH_FOX_UniV2: "0x470e8de2eBaef52014A47Cb5E6aF86884947F08c", // LP token used in staking
    },
    pools: {
      GIV_FOX_UniV3: "0xad0E10Df5dCDF21396b9d64715aaDAf543F8B376",
    },
    staking: {
      stakingFoxy: "0xee77aa3Fd23BbeBaf94386dD44b548e9a785ea4b",
      FOXy: "0xDc49108ce5C57bc3408c3A5E95F3d864eC386Ed3",
      stakingUNIv2Contracts: [
        "0xDd80E21669A664Bce83E3AD9a0d74f8Dad5D9E72", // v1
        "0xc54b9f82c1c54e9d4d274d633c7523f2299c42a0", // v2
        "0x212ebf9fd3c10f371557b08e993eaab385c3932b", // v3
        "0x24FD7FB95dc742e23Dc3829d3e656FEeb5f67fa0", // v4
        "0xC14eaA8284feFF79EDc118E06caDBf3813a7e555", // v5
        "0xEbB1761Ad43034Fd7FaA64d84e5BbD8cB5c40b68", // v6
        "0x5939783dbf3e9f453a69bc9ddc1e492efac1fbcb", // v7
        "0x662da6c777a258382f08b979d9489c3fbbbd8ac3", // v8
        "0x721720784b76265aa3e34c1c7ba02a6027bcd3e5", // v9
        "0xe7e16e2b05440c2e484c5c41ac3e5a4d15da2744", // Evergreen
      ]
    }
  },
  arbitrum: {
    tokens: {
      FOX: "0xf929de51d91c77e42f5090069e0ad7a09e513c73",
    },
    pools: {
      ETH_FOX_UniV2: "0x5f6ce0ca13b87bd738519545d3e018e70e339c24",
      ETH_FOX_UniV3: "0x76d4D1EAA0C4b3645E75C46E573c1d4F75E9041e",
    },
    staking: {
      stakingRFOXProxy: "0xac2a4fd70bcd8bab0662960455c363735f0e2b56",
      stakingRFOX: "0x4f9c6a6cc987de98c8109e121516008906a899c9",
    }
  },
  polygon: {
    tokens: {
      FOX: "0x65A05DB8322701724c197AF82C9CaE41195B0aA8",
    },
    pools: {
      ETH_FOX_SushiSwap: "0x93eF615F1DdD27d0E141Ad7192623A5c45e8f200",
    }
  },
  xdai: { // Gnosis
    tokens: {
      FOX: "0x21a42669643f45bc0e086b8fc2ed70c23d67509d",
    },
    pools: {
      XDAI_FOX_UniV2: "0xC22313fD39F7d4D73A89558F9E8E444C86464BAc",
      HNY_FOX_UniV2: "0x8a0Bee989c591142414ad67FB604539d917889dF",
      GIV_FOX_UniV2: "0x75594f01dA2e4231e16e67f841C307C4Df2313d1",
    }
  }
};

function generateExports() {
  const exports = {
    methodology: "We count liquidity of FOX deposited on Uniswap V2 and V3 pools on Ethereum, Arbitrum, Gnosis and a SushiSwap pool on Polygon using on-chain data. For Staking we count the FOX tokens locked in RFOX on Arbitrum and its predecessor FOXy on Ethereum which are single asset staking contracts used for revenue sharing.",
  };

  for (const [chain, data] of Object.entries(chains)) {
    exports[chain] = {
      tvl: async () => ({}),
    };

    if (data.pools) {
      exports[chain].pool2 = pool2s(
        Object.values(data.pools),
        [data.tokens.FOX]
      );
    }

    if (data.staking) {
      exports[chain].staking = stakings(
        Object.values(data.staking).flat(),
        Object.values(data.tokens)
      );
    }
  }

  return exports;
}

module.exports = generateExports();
