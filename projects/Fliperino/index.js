const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')

const fliperinoContractETHW = "0x1A25ee44ab9874C6652D35b26271937F43043F93";

module.exports = {
  ethpow: {
    tvl: async ( _, _b,{ ethpow: block}) => {
      return sumTokens2({ owner: fliperinoContractETHW, chain: 'ethpow', block, tokens: [nullAddress]})
    },
  },
};
