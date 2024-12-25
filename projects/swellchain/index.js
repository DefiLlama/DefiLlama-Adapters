const { sumTokensExport } = require("../helper/unwrapLPs");
const {tokens} = require("../swellchain/tokenMap")
const { sumUnknownTokens } = require('../helper/unknownTokens')

async function otherTvl(api) {

  const supplys = await api.multiCall({ 
    abi: "uint256:totalSupply",
    calls: tokens
  })

  api.add(tokens, supplys)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true, })
}


module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0x7aA4960908B13D104bf056B23E2C76B43c5AACc8", // L1StandardBridge
        "0x758E0EE66102816F5C3Ec9ECc1188860fbb87812", // OptimismPortal2
        "0xecf3376512EDAcA4FBB63d2c67d12a0397d24121", // wstETH L1ERC20TokenBridge
      ],
      fetchCoValentTokens: true,
    }),
    methodology: "Assets locked in Mainnet Canonical Bridges (ETH, wstETH) and Onchain Supply of LayerZero OFTs and HyperLane HypERC20s",
  },
  swellchain : { tvl: otherTvl }
};
