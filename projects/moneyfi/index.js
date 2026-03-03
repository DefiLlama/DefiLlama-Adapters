const { sumTokens2 } = require("../helper/unwrapLPs");
const { function_view } = require("../helper/chain/aptos");
const ADDRESSES = require("../helper/coreAssets.json");

async function get_tvl_aptos() {
  const tvl = await function_view({
    functionStr:
      "0x97c9ffc7143c5585090f9ade67d19ac95f3b3e7008ed86c73c947637e2862f56::vault::get_assets",
    args: [],
    type_arguments: [],
  });

  return tvl;
}

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
      "0x21D5b4352878415846785B923622B504D65cd5DF"
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
    ADDRESSES.ethereum.USDC, // USDC
    ADDRESSES.ethereum.USDT, // USDT
  ],
  bsc: [
    ADDRESSES.bsc.USDC, // USDC
    ADDRESSES.bsc.USDT, // USDT
  ],

  base: [
    ADDRESSES.base.USDC, //USDC
    ADDRESSES.base.USDT, // USDT
  ],

  arbitrum: [
    ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
    ADDRESSES.arbitrum.USDT, // USDT
  ],
  optimism: [
    ADDRESSES.optimism.USDC_CIRCLE, // USDC
    ADDRESSES.optimism.USDT, // USDT
  ],
  core: [
    ADDRESSES.core.USDC, // USDC
    ADDRESSES.core.USDT, // USDT
  ],
  soneium: [
    ADDRESSES.soneium.USDC, // USDC
    "0x102d758f688a4C1C5a80b116bD945d4455460282", // USDT
  ],
};
const chainExports = {};

Object.keys(config).forEach((chain) => {
  const chainConfig = config[chain];
  const tokens = stablecoins[chain];

  chainExports[chain] = {
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

chainExports.aptos = {
  tvl: async (api) => {
    const [addresses, amounts] = await get_tvl_aptos();
    for (let i = 0; i < addresses.length; ++i) {
      api.add(addresses[i], amounts[i]);
    }
  },
};

module.exports = {
  ...chainExports,
  timetravel: true,
  methodology:
    "TVL counts stablecoins in fundVault, dexBridgeVault, and all strategies contracts.",
};
