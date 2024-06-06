const { sumTokensExport, } = require('../helper/unwrapLPs');

// https://docs.gondi.xyz/protocol-contracts
const multiSourceLoan = "0x478f6F994C6fb3cf3e444a489b3AD9edB8cCaE16";
const userVault = "0x14a6Dcebb2Bb73aae1b199CCAadA75247b81976D";

module.exports = {
  methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds.`,
  ethereum: {
    tvl: sumTokensExport({ owners: [multiSourceLoan, userVault], resolveNFTs: true, }),
  }
}
