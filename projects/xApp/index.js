const { sumTokens2 } = require('../helper/unwrapLPs');

const tokensAndOwners = [
    ['0x90b71b077BD5b7Ae47a19153Cd8E7BB5b8077E80', '0x96500a433E0b67B3438cf01677E38c9EFDeF4a56'],
    ['0xae5BcC1Ef83CC3d3a8f69E9eB5380458eDbC1788', '0xBA9826C84304118bd444EFC6980753aA8083b4A4']
]

module.exports = {
   crossfi: {
    tvl: () => ({}),
    pool2: () => sumTokens2({
        tokensAndOwners,
        chain: 'crossfi',
        resolveLP: true,
        useDefaultCoreAssets: true,
      })
  },
};