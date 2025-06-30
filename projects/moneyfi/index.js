const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  ethereum: {
    fundVault: "0x5E672Af2d78dAaBbe8A8bF52D4D921A5c2DD41a4",
    dexBridgeVault: "0xf9139312E668EE8011F6c594ba24271eE5C913d5",
    strategies: [
      "0x3448263b315E73bCAfC28296a41FE80E4Ae49AD6",
      "0xc5224ba06A932b65909B6Fa53B263D5b84ba1c07",
    ],
  },

  bsc: {
    fundVault: "0x8Bd37E40273c5315fa6c26F8EAfFC9CcF0FDc9F8",
    dexBridgeVault: "0x615A1f9a10400B972551Af5F377Ab43933c15462",
    strategies: ["0xDB8E607156398b0ED714DA6674D640Dd5BE49170"],
  },

  base: {
    fundVault: "0xf8Ff1f6dd407352205936b31Cbff2CAdB56573af",
    dexBridgeVault: "0xb65c0A9b38C40Ac79E71BF1184De49293708FDFD",
    strategies: [
      "0xE2e326496dc7A7bC75a10E3Fb29E52AdAFCB342c",
      "0x4cb9289b27FAF51D1FC9E434D5384B376DbB48C0",
    ],
  },

  arbitrum: {
    fundVault: "0xBC2be60668b0ed00D3E4fdDd8f2794bfDa566661",
    dexBridgeVault: "0xe13fDaD37480502028987B70f104490eFE7ac176",
    strategies: ["0x0d13f57F94f58b69E9Cd1335FB60Fea834dcb38f"],
  },

  optimism: {
    fundVault: "0x7dd73b72c4F260E51b376d678f93efFe8387ffad",
    dexBridgeVault: "0x1F18B8289a702F26625e0cb91DcACc48273F8526",
    strategies: ["0x2840f364E1cB5f83B6158618E7aaFb0a0AEb6736"],
  },

  core: {
    fundVault: "0x3448263b315E73bCAfC28296a41FE80E4Ae49AD6",
    dexBridgeVault: "0x1B92EF64d4197690F9B8758f122585edc89d67C6",
    strategies: ["0x948e4B1F0A199d6C27CD1118483a45843222F60C"],
  },

  soneium: {
    fundVault: "0x1a842A4F6C9FaDA6230581cAfBE6619D4B3aBA7d",
    dexBridgeVault: "0x952969Bf806F6b8c2FCF4FB375C60E8D4EA7209E",
    strategies: ["0x57E04AB2Ca2cc69e69766cBe7EAc3A2db44c531b"],
  },
};

const stablecoins = {
  ethereum: [
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  ],
  bsc: [
    "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
    "0x55d398326f99059ff775485246999027b3197955", // USDT
  ],

  base: [
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", //USDC
    "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", // USDT
  ],

  arbitrum: [
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
  ],
  optimism: [
    "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC
    "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // USDT
  ],
  core: [
    "0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9", // USDC
    "0x900101d06A7426441Ae63e9AB3B9b0F63Be145F1", // USDT
  ],
  soneium: [
    "0xbA9986D2381edf1DA03B0B9c1f8b00dc4AacC369", // USDC
    "0x102d758f688a4C1C5a80b116bD945d4455460282", // USDT
  ],
};

Object.keys(config).forEach((chain) => {
  const chainConfig = config[chain];
  const tokens = stablecoins[chain];

  module.exports[chain] = {
    tvl: async (api) => {
      await sumTokens2({
        api,
        ownerTokens: [[tokens, chainConfig.fundVault]],
      });

      await sumTokens2({
        api,
        ownerTokens: [[tokens, chainConfig.dexBridgeVault]],
      });

      for (const strategy of chainConfig.strategies) {
        const total = await api.call({
          target: strategy,
          abi: "function totalAssets() view returns (uint256)",
        });
        api.add(tokens[0], total);
      }
    },
  };
});
