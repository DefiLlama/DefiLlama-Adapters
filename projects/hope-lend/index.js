const { aaveExports } = require('../helper/aave');

module.exports = {
  ethereum: aaveExports("ethereum", "0x53FbcADa1201A465740F2d64eCdF6FAC425f9030", id => id, ['0x17b5896703b36879A037Aa94F08622ab113C0AD4'], {
    abis: {
      getAllATokens: 'function getAllHTokens() view returns (tuple(string symbol, address tokenAddress)[])',
    }
  }),
  hallmarks: [
    [Math.floor(new Date('2023-10-18')/1e3), 'Protocol was hacked!'],
  ],
};

delete module.exports.ethereum.borrowed