const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");
const { getBalance } = require("@defillama/sdk/build/eth");
const { getBlock } = require("@defillama/sdk/build/util/blocks");

module.exports = {
  bitcoin: {
    tvl: async (api) => {
      const block = (await getBlock("rsk", api.timestamp)).block;
      const unminted =
        (
          await getBalance({
            target: "0x0000000000000000000000000000000001000006",
            chain: "rsk",
            block,
          })
        ).output / 1e18;

      const minted = 21e6 - unminted;

      return { "coingecko:bitcoin": minted };
    },
  },
  ethereum: {
    tvl: sumTokensExport({
      owner: "0x12eD69359919Fc775bC2674860E8Fe2d2b6a7B5D",
      fetchCoValentTokens: true,
      logCalls: true,
    }),
  },
  rsk: {
    tvl: sumTokensExport({
      owner: "0x9d11937E2179dC5270Aa86A3f8143232D6DA0E69",
      tokens: [
        "0x44fcd0854d745EfdeF4Cfe9868efE4d4EB51eCD6",
        "0x70566D8541beaBe984c8BAbF8A816Ed908514Ba8",
        "0xFF9EA341d9ea91CB7c54342354377f5104Fd403f",
        "0x4991516DF6053121121274397A8C1DAD608bc95B",
        "0x1BDa44fda023F2af8280a16FD1b01D1A493BA6c4",
        ADDRESSES.rsk.rUSDT,
        "0x75c6e15702ebAcd51177154ff383DF9695E1B1DA",
        "0x9C3a5F8d686fadE293c0Ce989A62a34408C4e307",
        "0xe506F698B31a66049bD4653Ed934e7A07Cbc5549",
        "0x14ADAE34beF7Ca957ce2DDe5AdD97EA050123827",
        "0x73C08467E23F7DcB7DdbBc8d05041b74467A498A",
        "0x83cf9a58d31d9014f02ebe282d10c25C28E7De15",
        "0xB3D06103aF1A68026615e673D46047fAB77dB0Fa",
        "0xE700691Da7B9851F2F35f8b8182C69C53ccad9DB",
        "0xe0CFF8a40f540657c62EB4CAC34b915e5ed8d8FF",
        "0x6B1a73d547F4009A26B8485b63D7015D248AD406",
        "0x2aCc95758f8b5F583470bA265Eb685a8f45fC9D5",
      ],
      logCalls: true,
      permitFailure: true,
    }),
  },
};
