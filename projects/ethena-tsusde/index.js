const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/chain/ton");


const vaultAddress = 'EQChGuD1u0e7KUWHH5FaYh_ygcLXhsdG2nSHPXHW8qqnpZXW'
const USDe = ADDRESSES.ton.USDe


module.exports = {
  timetravel: false,
  methodology: "USDe is locked on the vault smart contract (EQChGuD1u0e7KUWHH5FaYh_ygcLXhsdG2nSHPXHW8qqnpZXW)",
  ton: {
    tvl: sumTokensExport({ owners: [vaultAddress], tokens: [USDe], }),
  }
}