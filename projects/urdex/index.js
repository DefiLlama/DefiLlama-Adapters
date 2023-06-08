const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const Contracts = {
  Pool: "0xF67D3a53a110a764DCa7123b9f3FC5B404566577",
  Chef: "0x235dB7AFE577A239150160ab7429bC3D6e25fdAa",
  Tokens: {
    BTC: ADDRESSES.arbitrum.WBTC,
    USDT: ADDRESSES.arbitrum.USDT,
    WETH: ADDRESSES.arbitrum.WETH
  },
  URD_USDT_LP: "0xA8eC0aa8fe4287E768Fd382845442Fa29F2886ef"
}

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ owner: Contracts.Pool, tokens: Object.values(Contracts.Tokens) }),
    pool2: staking(Contracts.Chef, Contracts.URD_USDT_LP)
  }
};
