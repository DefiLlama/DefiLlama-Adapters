const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  bsc: {
    misrepresentedTokens: true,
    tvl: getUniTVL({
      chain: 'bsc',
      factory: '0x03879e2a3944fd601e7638dfcbc9253fb793b599',
      coreAssets: [
        '0x23c5d1164662758b3799103effe19cc064d897d6', // AURA
        '0xe9e7cea3dedca5984780bafc599bd69add087d56',  // BUSD
        '0xaEC945e04baF28b135Fa7c640f624f8D90F1C3a6',  // C98
      ]
    })
  }
}