const { call } = require("../helper/chain/elrond");

const ADDRESSES = require('../helper/coreAssets.json');

const tvl = async (_, _1, _2, { api }) => {
  const tokenPrice = await call({ target: 'erd1qqqqqqqqqqqqqpgqaqxztq0y764dnet95jwtse5u5zkg92sfacts6h9su3', abi: 'getTokenPrice', responseTypes: ['number'] });
  const lsTokenSupply = await call({ target: 'erd1qqqqqqqqqqqqqpgqaqxztq0y764dnet95jwtse5u5zkg92sfacts6h9su3', abi: 'getLiquidTokenSupply', responseTypes: ['number'] });
  api.add(ADDRESSES.null, tokenPrice * lsTokenSupply / 1e18)
};

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
  },
};
