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
      pool: "", // Add Base Aave V3 addresses
      oracle: "",
      poolDataProvider: ""
    },
    ajna: {
      pool: "", // Add Base Ajna addresses
      quoteToken: ""
    },
    morphoBlue: {
      market: "", // Add Base Morpho Blue addresses
      urdFactory: ""
    }
  },
  arbitrum: {
    aaveV3: {
      pool: "", // Add Arbitrum Aave V3 addresses
      oracle: "",
      poolDataProvider: ""
    },
    ajna: {
      pool: "", // Add Arbitrum Ajna addresses
      quoteToken: ""
    }
  },
  optimism: {
    aaveV3: {
      pool: "", // Add Optimism Aave V3 addresses
      oracle: "",
      poolDataProvider: ""
    },
    ajna: {
      pool: "", // Add Optimism Ajna addresses
      quoteToken: ""
    }
  }
};

module.exports = {
  ADDRESSES
}; 