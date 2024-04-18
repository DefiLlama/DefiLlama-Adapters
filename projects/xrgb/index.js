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
};
