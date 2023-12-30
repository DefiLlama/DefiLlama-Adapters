const { sumTokensExport, } = require('../helper/unwrapLPs')

// Vaults
const lpCoreEthPool = "0x7CA34cF45a119bEBEf4D106318402964a331DfeD";

module.exports = {
  methodology: `Counts the floor value of all deposited NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
  ethereum: {
    tvl: sumTokensExport({
      owners: [lpCoreEthPool],
      resolveNFTs: true,
    }),
  }
}