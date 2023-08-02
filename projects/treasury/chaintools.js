const ADDRESSES = require('../helper/coreAssets.json')
const MULTISIG_ADDRESS = "0xb0Df68E0bf4F54D06A4a448735D2a3d7D97A2222";
const CTLS_ADDRESS = "0xE155F64B9aD8c81318c313196a60c72e72fD2cD1";
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: [MULTISIG_ADDRESS,], tokens: [ADDRESSES.ethereum.WETH, ADDRESSES.null,  ADDRESSES.ethereum.USDC,], }),
    ownTokens: sumTokensExport({ owners: [MULTISIG_ADDRESS,], tokens: [CTLS_ADDRESS, ], }),
  },
};
