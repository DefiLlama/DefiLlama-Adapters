const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  blast: {
    tvl: sumTokensExport({ owners: [
      '0xE1A2E68C401378050fdba9704FA8BCb1f72b98f4',
      '0x8F9C9f888A4268Ab0E2DDa03A291769479bAc285'
    ], tokens: [ADDRESSES.blast.USDB]})
  },
  methodology: `TVL is the total quantity of USDB held in the conditional tokens contract as well as USDB collateral submitted to every predict.fun market ever opened - once the markets resolve, participants are able to withdraw their share given the redemption rate and their input stake.`
}
