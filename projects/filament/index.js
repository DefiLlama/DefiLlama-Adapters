const { sumTokensExport } = require("../helper/unwrapLPs");

const USDC_CONTRACT = '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1';
const FILAMENT_VAULT_CONTRACT = '0xbeB6A6273c073815eBe288d2dF4e5E8bc027DA11';

module.exports = {
  sei: {
    tvl: sumTokensExport({ owner: FILAMENT_VAULT_CONTRACT, tokens: [USDC_CONTRACT] }),
  },
}
