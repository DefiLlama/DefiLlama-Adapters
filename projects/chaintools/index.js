const ADDRESSES = require('../helper/coreAssets.json')
const YIELD_BOOSTER_ADDRESS = "0x9954B485E650E067BCAD654F66CD67DAC122123b";
const YIELD_VAULT_ADDRESS = "0xce2C952B27FCc41F868BDC32c9411F0759378ED0";
const MULTISIG_ADDRESS = "0xb0Df68E0bf4F54D06A4a448735D2a3d7D97A2222";
const CTLS_ADDRESS = "0xE155F64B9aD8c81318c313196a60c72e72fD2cD1";
const UNI_V3_POOL = "0xc53489F27F4d8A1cdceD3BFe397CAF628e8aBC13"; //  we cant count liquidity on uni v3 as your tvl
const INCENTIVES_WALLET = "0x9318a070a16E25554f098c6930B506123b66E19d"; // this is EOA, whis is it included in tvl?
const COMPOUNDING_KEEPER_ADDRESS = "0x5648C24Ea7cFE703836924bF2080ceFa44A12cA8"; // this is EOA, whis is it included in tvl?

const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: "Total balances of the Uniswap V3 Pool plus protocol/user controlled balances (in WETH+ETH and CTLS)",
  ethereum: {
    tvl: sumTokensExport({ owners: [YIELD_VAULT_ADDRESS,], tokens: [ADDRESSES.ethereum.WETH, ADDRESSES.null, ], }),
    staking: sumTokensExport({ owners: [YIELD_BOOSTER_ADDRESS, YIELD_VAULT_ADDRESS,], tokens: [CTLS_ADDRESS,], }),
  },
};
