const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const owner = "0xcE42C112e617c9BB1Bd8238D6Bb83B89e112fDbc"; // vault address
const tokens = [ADDRESSES.base.USDbC]; // USDC

module.exports = {
  base: {
    tvl: sumTokensExport({ owner, tokens }),
  },
};
