const { sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: "Staking tokens via BounceBit counts as TVL",
  ethereum: {
    tvl: sumTokensExport({
      owners: ["0xc50f5f0e2421c307b3892a103b45b54f05259668"],
      tokens: [ADDRESSES.ethereum.WETH, "0x5cc5e64ab764a0f1e97f23984e20fd4528356a6a"]
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x9a5936bab8f9ae1d89da5fa95c484f7ad597c8c0"],
      tokens: [ADDRESSES.bsc.WBNB, "0x5cc5e64ab764a0f1e97f23984e20fd4528356a6a"]
    }),
  },
  base: {
    tvl: sumTokensExport({
      owners: ["0xe05bfbbb4acfb9d79daf3718c8e4f8fb539c579a"],
      tokens: [ADDRESSES.base.WETH, "0x5cc5e64ab764a0f1e97f23984e20fd4528356a6a"]
    }),
  },
  linea: {
    tvl: sumTokensExport({
      owners: ["0xccf4fd9f2fbe89917821e4629cb2a6b760651baf"],
      tokens: [ADDRESSES.linea.WETH, "0x5cc5e64ab764a0f1e97f23984e20fd4528356a6a"]
    }),
  },
};
