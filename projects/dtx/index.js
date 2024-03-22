const { sumERC4626VaultsExport } = require("../helper/erc4626")

module.exports = {
  blast: {
    tvl: sumERC4626VaultsExport({
      vaults: [
        "0x56e0f6DF03883611C9762e78d4091E39aD9c420E",
        "0x3D4621fa5ff784dfB2fcDFd5B293224167F239db",
        "0xe97D34E531E1b299047A94Fc6854289830362d8f",
        "0xBa95FCe6c2683C29bD963dd201CA8ee8f3605801",
        "0x037A168876d3027b1384FD1752fEAa52407726dB",
      ],
      isOG4626: true,
    }),
  },
}
