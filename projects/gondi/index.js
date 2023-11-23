const { sumTokensExport, } = require('../helper/unwrapLPs');

// Vaults
const multiSourceLoan = "0xCa5a494Ca20483e21ec1E41FE1D9461Da77595Bd";

module.exports = {
  methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds.`,
  ethereum: {
    tvl: sumTokensExport({ owners: [multiSourceLoan], resolveNFTs: true, }),
  }
}
