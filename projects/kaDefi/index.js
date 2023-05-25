const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unknownTokens');

const WkavaKafiLpAddress = "0xA4Bea6f776f483a304FD6980F8F8c861AB24DE07";
const ERC20ContractWkavaAddress = ADDRESSES.kava.WKAVA;
const ERC20ContractKafiAddress = "0x7356deD08af181869B492fcd641f4aEfB74De3E7";
const POL_Pool_One = "0xdf65B85E43dBa1F153325e7e4A0682B7DeBBFe0f";
const POL_Pool_Two = "0x738d2b4b59A0A3AA4086bC44C40a45845bB73FCC";

module.exports = {
  kava: {
    tvl: sumTokensExport({ owners: [POL_Pool_One, POL_Pool_Two], tokens: [ERC20ContractWkavaAddress], }),
    staking: sumTokensExport({ owners: [POL_Pool_One, POL_Pool_Two], tokens: [ERC20ContractKafiAddress], useDefaultCoreAssets: true, lps: [WkavaKafiLpAddress], }),
  }
};


