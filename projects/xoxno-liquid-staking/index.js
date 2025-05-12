const { call, } = require("../helper/chain/elrond");

const ADDRESSES = require('../helper/coreAssets.json');

const tvl = async () => {
  return { ['elrond:' + ADDRESSES.null]: await call({ target: 'erd1qqqqqqqqqqqqqpgq6uzdzy54wnesfnlaycxwymrn9texlnmyah0ssrfvk6', abi: 'getVirtualEgldReserve', responseTypes: ['number'] }) }
};

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
  },
};
