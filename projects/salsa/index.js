const { call } = require("../helper/chain/elrond");

const ADDRESSES = require('../helper/coreAssets.json');

const tvl = async (api) => {
  const tokenPrice = await call({ target: 'erd1qqqqqqqqqqqqqpgqaqxztq0y764dnet95jwtse5u5zkg92sfacts6h9su3', abi: 'getTokenPrice', responseTypes: ['number'] });
  const lsTokenSupply = await call({ target: 'erd1qqqqqqqqqqqqqpgqaqxztq0y764dnet95jwtse5u5zkg92sfacts6h9su3', abi: 'getLiquidTokenSupply', responseTypes: ['number'] });
  api.add(ADDRESSES.null, tokenPrice * lsTokenSupply / 1e18)

  const egldReserve = await call({ target: 'erd1qqqqqqqqqqqqqpgqaqxztq0y764dnet95jwtse5u5zkg92sfacts6h9su3', abi: 'getEgldReserve', responseTypes: ['number'] });
  api.add(ADDRESSES.null, egldReserve)
};

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
  },
};
