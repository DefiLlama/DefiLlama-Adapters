const { getWhitelistedNFTs, } = require('../helper/tokenMapping');
const { sumTokensExport, } = require('../helper/unwrapLPs');

// Vaults
const collateralVault = "0xA79da8c90Aa480B3716C23145154CA6eF5Fc29C1";
const punkVault = "0xA79da8c90Aa480B3716C23145154CA6eF5Fc29C1";

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
  ethereum: {
    tvl: sumTokensExport({ owners: [collateralVault, punkVault], tokens: getWhitelistedNFTs(),}),
  }
}