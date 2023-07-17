const { getUniTVL } = require('../helper/unknownTokens')

const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');
config.setProvider("neon_evm", new ethers.providers.StaticJsonRpcProvider(
    "https://neon-proxy-mainnet.solana.p2p.org",
    {
      name: "neon_evm",
      chainId: 245022934,
    }
  ))
  

const dexTVL_neon = getUniTVL({ factory: '0xd43F135f6667174f695ecB7DD2B5f953d161e4d1', useDefaultCoreAssets: true })


module.exports = {
    misrepresentedTokens: true,
    neon_evm: {
        tvl: dexTVL_neon,
    }
};


