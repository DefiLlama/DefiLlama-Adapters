const { sumERC4626VaultsExport } = require('../helper/erc4626')

const USDC_VAULT = "0x756d09263483dC5A6A0023bb80933db2C680703E";
const USDC_2_VAULT = "0x69e475b67052987707E953b684c7d437e15AC511";
const WFTM_VAULT = "0x22c538c1EeF31B662b71D5C8DB47847d30784976";

module.exports = {
  timetravel: false,
  methodology: `Track the yield generated and deposits made to the vaults`,
  fantom: {
    tvl: sumERC4626VaultsExport({ vaults: [USDC_VAULT, USDC_2_VAULT, WFTM_VAULT], tokenAbi: 'token', balanceAbi: 'totalAssets' }),
  },
};
