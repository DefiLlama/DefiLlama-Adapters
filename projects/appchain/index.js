const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x19df42E085e2c3fC4497172E412057F54D9f013E", // Bridge
          "0x1c71201B43B45ACdF9AfD6A72817C0469F0dD274", // Standard Gateway
          "0xCdbbaC12527d6aB4d94bc524849c001574D88f65", // Custom Gateway
          "0xcE586d7e3920cAddf1dd2e5b5c94B2Cfe6118e1c", // WETH Gateway
          "0x8045B2aa6b823CbA8f99ef3D3404F711619d3473", // Sequencer Inbox
        ],
        fetchCoValentTokens: true,
        permitFailure: true,
      }),
  },
};