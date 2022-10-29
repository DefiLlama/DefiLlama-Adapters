const sdk = require("@defillama/sdk");
const { gmxExports } = require("../helper/gmx");

const chain = "bsc";
module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([
      gmxExports({ chain, vault: '0xFD8c82a5Eb07147Ff49704b67c931EC7aFd9CCEA', }),
      gmxExports({ chain, vault: '0xb160c4070Ba9183dA27a66D53209Eb2191Df5Bd7', }),
    ])
  }
}