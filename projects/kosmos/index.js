const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const bondTellers = ["0x04B07dFBB78d32FF500466c35B4Fe5D615cbe911", "0x8d4439F8AC1e5CCF37F9ACb527E59720E0ccA3E3"];

module.exports = {
  airdao: { tvl: sumTokensExport({ owners: bondTellers,
    tokens: [ADDRESSES.null, ADDRESSES.airdao.USDC, '0x096B5914C95C34Df19500DAff77470C845EC749D']
  }) },
  methodology: `The TVL of Kosmos is equal to the total value of underlying assets locked in the BondTellers contracts.`,
};
