const { getUniTVL, staking } = require('../helper/unknownTokens')

const xDOGMONEY = "0xC5c70fA7A518bE9229eB0Dc84e70a91683694562";
const DOGMONEY = "0x93C8a00416dD8AB9701fa15CA120160172039851";
const FACTORY = "0xaF85e6eD0Da6f7F5F86F2f5A7d595B1b0F35706C";

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: FACTORY,
    }),
    staking: staking({ owner: xDOGMONEY, tokens: [ DOGMONEY ], lps: ['0x9ab710cd0bfbee60e14115d19c76213c4d4b1687'], useDefaultCoreAssets: true, })
  }
}