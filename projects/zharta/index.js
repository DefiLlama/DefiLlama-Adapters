const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require('../helper/unwrapLPs')

// Vaults
const collateralVault = "0xA79da8c90Aa480B3716C23145154CA6eF5Fc29C1";
const punkVault = "0x94925030F48aDfc3e4A65a2E0A7444733406c144";
const LP_CORE = "0xe3c959bc97b92973d5367dbf4ce1b7b9660ee271";
const appraisalVault = "0xA79da8c90Aa480B3716C23145154CA6eF5Fc29C1";

module.exports = {
  methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
  ethereum: {
    tvl: sumTokensExport({
      owners: [collateralVault, punkVault, appraisalVault, LP_CORE],
      tokens: [ADDRESSES.ethereum.WETH],
      resolveNFTs: true,
    }),
  }
}