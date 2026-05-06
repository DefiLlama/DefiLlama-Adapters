const { sumTokensExport, } = require('../helper/unwrapLPs');

// https://docs.gondi.xyz/gondi-v3/protocol-contracts
const multiSourceLoan = "0xf65b99ce6dc5f6c556172bcc0ff27d3665a7d9a8";
const userVault = "0x823de2c44369e94cac3da789ad4b6493e27e4bfe";

// V3.1
const multiSourceLoanV31 = "0xf41B389E0C1950dc0B16C9498eaE77131CC08A56";
const multiSourceLoanV31Hype = "0x6ad675624ec8320e5806858cd5db101a0b927fd9";

module.exports = {
  methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds. NFT floor pricing is only available on Ethereum; on HyperEVM only ERC20 collateral is counted.`,
  ethereum: {
    tvl: sumTokensExport({ owners: [multiSourceLoan, userVault, multiSourceLoanV31], resolveNFTs: true, }),
  },
  hyperliquid: {
    tvl: sumTokensExport({ owners: [multiSourceLoanV31Hype], fetchCoValentTokens: true, tokenConfig: { ignoreMissingChain: true, }, }),
  },
}
