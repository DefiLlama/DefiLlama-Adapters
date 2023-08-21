const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = [ADDRESSES.base.USDbC]; // USDC

module.exports = {
  base: { // sum vault balances
    tvl: sumTokensExport({ owners: ['0x8D5b64b8D8904E4aEc79F10468F347534D2A1b79', '0xcE42C112e617c9BB1Bd8238D6Bb83B89e112fDbc'], tokens }),
  },
};
