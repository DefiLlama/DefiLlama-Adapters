const { sumTokensExport } = require('../helper/unwrapLPs')

const VAULT_CONTRACT = '0x795E2FCb8E2A3786F4A318b84a6e1BfFF4Cf285A';
const PUSD_CONTRACT = '0x42725b4D9270CFe24F6852401fdDa88248CB4dE9';

module.exports = {
  methodology: 'counts the value of PUSD in the Artura Vault contract.',
  btnx: {
    tvl: sumTokensExport({ tokensAndOwners: [[PUSD_CONTRACT, VAULT_CONTRACT]] }),
  }
}; 