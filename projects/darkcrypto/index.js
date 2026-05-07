const { stakingPriceLP } = require("../helper/staking");
const vaultUtils = require("./vault-utils")
const { pool2Balances } = require("./farm-utils");

const sky = "0x9D3BBb0e988D9Fb2d55d07Fe471Be2266AD9c81c";
const boardroom = "0x2e7d17ABCb9a2a40ec482B2ac9a9F811c12Bf630";
const masterChef = "0x42B652A523367e7407Fb4BF2fA1F430781e7db8C"

async function vault(api){
  return vaultUtils.vaultLocked(api)
}

module.exports = {
  doublecounted: true,
  cronos: {
    tvl:vault,
    pool2: (api) => pool2Balances(api, masterChef),
    staking: stakingPriceLP(
      boardroom,
      sky,
      "0xaA0845EE17e4f1D4F3A8c22cB1e8102baCf56a77"
    ),
  },
};
