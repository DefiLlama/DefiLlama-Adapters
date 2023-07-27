const { call } = require("../helper/chain/elrond");

const ADDRESSES = require('../helper/coreAssets.json');

const tvl = async () => {
  const tokenPrice = await call({ target: 'erd1qqqqqqqqqqqqqpgqaqxztq0y764dnet95jwtse5u5zkg92sfacts6h9su3', abi: 'getTokenPrice', responseTypes: ['number'] });
  const lsTokenSupply = await call({ target: 'erd1qqqqqqqqqqqqqpgqaqxztq0y764dnet95jwtse5u5zkg92sfacts6h9su3', abi: 'getLiquidTokenSupply', responseTypes: ['number'] });

  return { ['elrond:' + ADDRESSES.null]: (tokenPrice * lsTokenSupply) / 1000000000000000000 };
};

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
  },
};
