// const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    /* tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x7C10a3b7EcD42dd7D79C0b9d58dDB812f92B574A',
    }) */
    tvl: () => ({}),
  },
  hallmarks: [
    [Math.floor(new Date('2023-10-25')/1e3), 'Rebranded as Chewyswap'],
  ],
}