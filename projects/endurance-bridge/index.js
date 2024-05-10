const { nullAddress } = require('../helper/tokenMapping');
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  endurance: {
    bridges: [
      '0xf3310e3f0D46FF5EE7daB69C73452D0ff3979Bed',
    ],
    tokens: {
      nullAddress
    }
  },
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: (_, _b, {[chain]: block }) => {
      const { bridges: owners, tokens } = config[chain]
      return sumTokens2({ tokens: Object.values(tokens), owners, chain, block })
    }
  }
})