const { call, } = require("../helper/chain/elrond");

const ADDRESSES = require('../helper/coreAssets.json');

const xoxno = "XOXNO-c1293a";

const staking = async (api) => {
  const staked = await call({
    target: 'erd1qqqqqqqqqqqqqpgqs5w0wfmf5gw7qae82upgu26cpk2ug8l245qszu3dxf',
    abi: "getVirtualXOXNOReserve",
    responseTypes: ["number"],
  });
  api.addTokens([xoxno], [staked.toString()]);
};

const tvl = async () => {
  return { ['elrond:' + ADDRESSES.null]: await call({ target: 'erd1qqqqqqqqqqqqqpgq6uzdzy54wnesfnlaycxwymrn9texlnmyah0ssrfvk6', abi: 'getVirtualEgldReserve', responseTypes: ['number'] }) }
};

module.exports = {
  timetravel: false,
  elrond: {
    staking,
    tvl,
  },
};
