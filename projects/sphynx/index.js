const { getUniTVL } = require('../helper/unknownTokens')
const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');

config.setProvider("bitgert", new ethers.providers.StaticJsonRpcProvider(
  "https://chainrpc.com",
  {
    name: "bitgert",
    chainId: 32520,
  }
))

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      factory: '0x8BA1a4C24DE655136DEd68410e222cCA80d43444',
    }),
  },
  bitgert: {
    tvl: getUniTVL({
      chain: 'bitgert',
      factory: '0xd4688F52e9944A30A7eaD808E9A86F95a0661DF8',
      coreAssets: [
        '0x0eb9036cbE0f052386f36170c6b07eF0a0E3f710', // WBRISE
      ]
    }),
  },
};
