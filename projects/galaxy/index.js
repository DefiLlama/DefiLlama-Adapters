const { getMorphoVaultTvl } = require("../helper/morpoho");

const ethereumConfig = {
  vaults: [
    "0x71ffB6a81786eC285D429d531Cf655107B9D878d",
    "0x91600E31fBeDc72433d4a57F16639cfe661Be7d8",
    "0x1878805799273d10aE96a58201A6f5254CF9824F"
  ]
}

const baseConfig = {
  vaults: [
    "0x1e9e47583f15D45a10Df48c0b1846E0492c795D7"
  ]
}

module.exports = {
  methodology: "TVL is calculated by summing the assets deposited in Galaxy's Morpho vaults on each supported chain, using the ERC4626 balances of the listed vault contracts.",
  ethereum: {
    tvl: getMorphoVaultTvl(undefined, {vaults: ethereumConfig.vaults})
  },
  base: {
    tvl: getMorphoVaultTvl(undefined, {vaults: baseConfig.vaults})
  }
}