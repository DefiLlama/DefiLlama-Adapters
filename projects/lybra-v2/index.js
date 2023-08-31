const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

// VAULTS
const stETHvault = "0xa980d4c0C2E48d305b582AA439a3575e3de06f0E";
const wstETHvault = "0x5e28B5858DA2C6fb4E449D69EEb5B82e271c45Ce";
const wbETHvault = "0xB72dA4A9866B0993b9a7d842E5060716F74BF262";
const rETHvault = "0x090B2787D6798000710a8e821EC6111d254bb958"

module.exports = {
  start: 17990141,
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners2: [[ADDRESSES.ethereum.STETH, "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", "0xa2e3356610840701bdf5611a53974510ae27e2e1", "0xae78736cd615f374d3085123a210448e74fc6393"], [stETHvault, wstETHvault, wbETHvault, rETHvault]] }),
  }
};
