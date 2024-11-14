const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  reya: { tvl: sumTokensExport({ owner: '0xA763B6a5E09378434406C003daE6487FbbDc1a80', tokens: [ADDRESSES.reya.RUSD, "0x4D3fEB76ab1C7eF40388Cd7a2066edacE1a2237D", "0x809B99df4DDd6fA90F2CF305E2cDC310C6AD3C2c", "0x2339D41f410EA761F346a14c184385d15f7266c4", "0xAAB18B45467eCe5e47F85CA6d3dc4DF2a350fd42", "0x6B48C2e6A32077ec17e8Ba0d98fFc676dfab1A30"]})}
}