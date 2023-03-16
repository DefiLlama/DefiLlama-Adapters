const { sumTokensExport, } = require('../helper/unwrapLPs');

// Vaults
const v2 = "0xf896527c49b44aAb3Cf22aE356Fa3AF8E331F280";
const v2_1 = "0x8252Df1d8b29057d1Afe3062bf5a64D503152BC8";

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
  ethereum: {
    tvl: sumTokensExport({ owners: [v2, v2_1], resolveNFTs: true, }),
  }
}
