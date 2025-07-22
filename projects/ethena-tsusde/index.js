const { sumTokensExport } = require("../helper/chain/ton");


const vaultAddress = 'EQChGuD1u0e7KUWHH5FaYh_ygcLXhsdG2nSHPXHW8qqnpZXW'
const USDe = 'EQAIb6KmdfdDR7CN1GBqVJuP25iCnLKCvBlJ07Evuu2dzP5f'


module.exports = {
  timetravel: false,
  methodology: "USDe is locked on the vault smart contract (EQChGuD1u0e7KUWHH5FaYh_ygcLXhsdG2nSHPXHW8qqnpZXW)",
  ton: {
    tvl: sumTokensExport({ owners: [vaultAddress], tokens: [USDe], }),
  }
}