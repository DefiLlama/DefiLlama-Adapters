const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')

const fliperinoContractETHW = "0x877929914e9854066FC4f1d4B1db2f8b029FeB79";

module.exports = {
  ethpow: {
    tvl: async (api) => {
      return sumTokens2({ owner: fliperinoContractETHW, api, tokens: [nullAddress]})
    },
  },
};
