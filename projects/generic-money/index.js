const { sumERC4626VaultsExport2 } = require("../helper/erc4626");

const vaults = [
    "0x4825eFF24F9B7b76EEAFA2ecc6A1D5dFCb3c1c3f", // USDC
    "0xB8280955aE7b5207AF4CDbdCd775135Bd38157fE", // USDT
    "0x6133dA4Cd25773Ebd38542a8aCEF8F94cA89892A", // USDS
]

module.exports = {
    methodology: "TVL counts the total assets on Generic Money's vaults which back gUSD and g-units.",
    ethereum: { tvl: sumERC4626VaultsExport2({ vaults }) },
}