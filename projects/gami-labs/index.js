const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology:
    "Count all assets deposited in all vaults curated by Gami Labs across Lagoon, Spectra, Silo, and Gearbox.",
  blockchains: {
    ethereum: {
      erc4626: [
        // Lagoon
        "0xdae854d0896ad2fee335689a3f7b4a95fd1a3e46", // Lagoon - Gami USDC
        "0x33e1339567c183fbadcb43f72d11c47229d468ab", // Lagoon - Gami Stake DAO USDC
        "0x414070fb9e64fd69160d75da57e75ba11f9f605a", // Lagoon - Gami WBTC
        "0x57e6824a8b15b709cefb4ccef644ba1349057e77", // Lagoon - xBTCY (cbBTC)
        "0x2a676c2744421b4fae65ce86b47adacb620047d4", // Lagoon - Gami hemiBTC
        "0x2031eceec018549a2c729cacd6c0bfc4be2524ed", // Lagoon - Gami ETH (WETH)
        "0xfab0f56c28e3f874b15922b213e696f37b670916", // Lagoon - Coinshift USPC Prime
        "0x09252d2c4afca9b1479efdd39faa53de9ff23114", // Lagoon - Coinshift Leveraged USPC
        // Gearbox
        "0x683faf5bafd88d4c383ccaf3d61c26af2e164409", // Gearbox - Gami WBTC
      ],
    },
    base: {
      erc4626: [
        "0x776f95321a0285f8bcde149e3264d16dc08da69a", // Spectra - Gami Spectra USDC
      ],
    },
    flare: {
      erc4626: [
        "0x6420a613e936602ca3f1ad5680b3f4d47d473bf1", // Spectra - Flare XRP Yield Prime
      ],
    },
    hemi: {
      erc4626: [
        "0x1e32c96757c07775ca4fc796c4f4311722eaf35e", // Lagoon - Hemi USDC
      ],
    },
    avax: {
      erc4626: [
        "0xb3a2bcb30c1460d88db18b42a29fae2399952874", // Lagoon - USDC Avalanche Core
      ],
      silo: [
        "0x1F0570a081FeE0e4dF6eAC470f9d2D53CDEDa1c5", // Silo - Gami Silo USDC
        "0x0F78Ea587D8E2950319e0b467c665bD2CB73051B", // Silo - Gami Silo AVAX
      ],
    },
  },
};

module.exports = getCuratorExport(configs);
