const { call, } = require("../helper/chain/elrond");

const ADDRESSES = require('../helper/coreAssets.json');

const tvl = async () => {
  return { ['elrond:' + ADDRESSES.null]: await call({ target: 'erd1qqqqqqqqqqqqqpgq4gzfcw7kmkjy8zsf04ce6dl0auhtzjx078sslvrf4e', abi: 'getCashReserve', responseTypes: ['number'] }) }
};

module.exports = {
  timetravel: false,
  elrond: {
    tvl,
  },
};
