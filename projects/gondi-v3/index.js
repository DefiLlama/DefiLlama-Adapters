const { sumTokensExport, } = require('../helper/unwrapLPs');

// https://docs.gondi.xyz/protocol-contracts
const multiSourceLoan = "0xf65b99ce6dc5f6c556172bcc0ff27d3665a7d9a8";
const userVault = "0x823de2c44369e94cac3da789ad4b6493e27e4bfe";

module.exports = {
  methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds.`,
  ethereum: {
    tvl: sumTokensExport({ owners: [multiSourceLoan, userVault], resolveNFTs: true, }),
  }
}
