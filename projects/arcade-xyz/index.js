const { getWhitelistedNFTs, } = require('../helper/tokenMapping');
const { sumTokensExport, } = require('../helper/unwrapLPs');

const loanProxy = "0x81b2F8Fc75Bab64A6b144aa6d2fAa127B4Fa7fD9";

module.exports = {
    misrepresentedTokens: true,
    methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
    ethereum: {
        tvl: sumTokensExport({ owners: [loanProxy], tokens: getWhitelistedNFTs(), }),
    }
}
