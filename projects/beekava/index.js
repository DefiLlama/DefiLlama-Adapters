const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unknownTokens')

const WkavaBeekLpAddress = "0x6F95ff58Cdbf17594882E7EF948687aC81c2fEE0";

const ERC20ContractWkavaAddress = ADDRESSES.kava.WKAVA;
const ERC20ContractBeekAddress = "0xb520e9C5123A450828c190cb6073583a5ecd0d74";

const POL_Pool_One = "0x00635507895D30801f60a2859990420013068ee0";
const POL_Pool_Two = "0x339522a317E74ac1f7D4d8D9bDc3181a9801416E";
const POL_Pool_Three = "0x8470991Ce998d336146104549A04690082f2B372";
const owners = [POL_Pool_One, POL_Pool_Two, POL_Pool_Three,]

module.exports = {
  kava: {
    tvl: sumTokensExport({ owners, tokens: [ERC20ContractWkavaAddress] }),
    pool2: sumTokensExport({ owners, tokens: [WkavaBeekLpAddress], lps: [WkavaBeekLpAddress], useDefaultCoreAssets: true, }),
    staking: sumTokensExport({ owners, tokens: [ERC20ContractBeekAddress], lps: [WkavaBeekLpAddress], useDefaultCoreAssets: true, }),
  }
};
