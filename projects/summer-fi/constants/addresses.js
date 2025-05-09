const ADDRESSES = {
  ethereum: {
    aaveV3: {
      pool: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
      oracle: "0x54586bE62E3c3580375aE3723C145253060Ca0C2",
      poolDataProvider: "0x41393e5e337606dc3821075Af65AeE84D7688CBD"
    },
    aaveV2: {
      pool: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
      oracle: "0xa50ba011c48153de246e5192c8f9258a2ba79ca9",
      poolDataProvider: "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d",
      wethGateway: "0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04"
    },
    morphoBlue: {
      market: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
      urdFactory: "0x7276454fc1CF9C408deeed722fd6b5E7A4CA25D8"
    },
    spark: {
      pool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
      rewards: "0xf9cc4F0D883F1a1eb2c253bdb46c254Ca51E1F44"
    }
  },
  base: {
    aaveV3: {
      pool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
      oracle: "0x2Cc0Fc26eD4563A5ce5e8bdcfe1A2878676Ae156",
      poolDataProvider: "0x2D8A3C5677189723C4cB8873CfC9C8976fDF38Ac"
    },
    ajna: {
      pool: "0x97fa9b0909C238D170C1ab3B5c728A3a45BBEcBa",
      quoteToken: "0x4200000000000000000000000000000000000006" // WETH on Base
    },
    morphoBlue: {
      market: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
      urdFactory: "0x7276454fc1CF9C408deeed722fd6b5E7A4CA25D8"
    }
  },
  arbitrum: {
    aaveV3: {
      pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
      oracle: "0xb56c2F0B653B2e0b10C9b928C8580Ac5Df02C7C7",
      poolDataProvider: "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654"
    },
    ajna: {
      pool: "0x30c5eF2997d6a882DE52c4ec01B6D0a5e5B4fAAE",
      quoteToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" // WETH on Arbitrum
    }
  },
  optimism: {
    aaveV3: {
      pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
      oracle: "0xD81eb3728a631871a7eBBaD631b5f424909f0c77",
      poolDataProvider: "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654"
    },
    ajna: {
      pool: "0x30c5eF2997d6a882DE52c4ec01B6D0a5e5B4fAAE",
      quoteToken: "0x4200000000000000000000000000000000000006" // WETH on Optimism
    }
  }
};

module.exports = {
  ADDRESSES
}; 