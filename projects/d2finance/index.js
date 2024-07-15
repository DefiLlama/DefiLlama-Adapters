const { sumERC4626VaultsExport } = require("../helper/erc4626");

const vaultTvl = sumERC4626VaultsExport({
  vaults: [
    "0x27D22Eb71f00495Eccc89Bb02c2B68E6988C6A42",
    "0x183424d5ae5ec9fd486634bc566d0f75ad9c9109",
    "0x80c403807b1032d7cb19b6d612ce23f05a213d36",
    "0x5b49d7fae00de64779ddcd6b067c8eb046bd9a0b",
    "0x291344FBaaC4fE14632061E4c336Fe3B94c52320",
    "0xEd80C858D43a1D043E86Cf1F20384e189cf23BDA",
    "0x4ada76cc8755f62508a2df65d7fafa4fd26e76c6",
    "0x1c17a39B156189BF40905425170a3Ff62fb650DA",
    "0x7348925D3C63e4E61e9F5308eEec0f06EaA3bB7b",
  ],
  isOG4626: true,
});

module.exports = {
  arbitrum: {
    tvl: vaultTvl,
  },
};
