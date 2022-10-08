const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')

const fliperinoContractETHW = "0x877929914e9854066FC4f1d4B1db2f8b029FeB79";

module.exports = {
  ethpow: {
    tvl: async ( _, _b,{ ethpow: block}) => {
      return sumTokens2({ owner: fliperinoContractETHW, chain: 'ethpow', block, tokens: [nullAddress]})
    },
  },
};
