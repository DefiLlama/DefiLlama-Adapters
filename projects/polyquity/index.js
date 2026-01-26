const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getLiquityTvl } = require('../helper/liquity')

const MATIC_TROVE_MANAGER_ADDRESS = "0xA2A065DBCBAE680DF2E6bfB7E5E41F1f1710e63b";
const USDC_TROVE_MANAGER_ADDRESS = "0x09273531f634391dE6be7e63C819F4ccC086F41c";

module.exports = {
  polygon: { tvl: sdk.util.sumChainTvls([getLiquityTvl(MATIC_TROVE_MANAGER_ADDRESS), getLiquityTvl(USDC_TROVE_MANAGER_ADDRESS, { collateralToken: ADDRESSES.polygon.USDC})]) },
};
