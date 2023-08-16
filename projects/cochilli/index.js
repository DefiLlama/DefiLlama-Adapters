const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const owner = "0x8D5b64b8D8904E4aEc79F10468F347534D2A1b79"; // vault address
const tokens = [ADDRESSES.base.USDbC]; // USDC

module.exports = {
  base: {
    tvl: sumTokensExport({ owner, tokens }),
  },
};
