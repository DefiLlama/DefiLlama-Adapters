const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryOP = "0x9D727911B54C455B0071A7B682FcF4Bc444B5596";
const treasuryETH = "0x9D727911B54C455B0071A7B682FcF4Bc444B5596"
const treasuryARB = "0x9D727911B54C455B0071A7B682FcF4Bc444B5596"

module.exports = treasuryExports({
  optimism: {
    tokens: [
      nullAddress,
      ADDRESSES.optimism.USDC, // USDC
      ADDRESSES.optimism.OP
    ],
    owners: [treasuryOP],
  },
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC, // USDC
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.TUSD,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.USDT,
      "0xE80C0cd204D654CEbe8dd64A4857cAb6Be8345a3",
      ADDRESSES.ethereum.WBTC,
      "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF", //AURA
      "0xB6eD7644C69416d67B522e20bC294A9a9B405B31", //0XBTC
    ],
    owners: [treasuryETH],
  },
  arbitrum: {
    tokens: [
        nullAddress,
      ADDRESSES.arbitrum.USDC, // USDC
      ADDRESSES.arbitrum.USDC_CIRCLE,
      ADDRESSES.arbitrum.WETH
    ],
    owners: [treasuryARB],
  },
});