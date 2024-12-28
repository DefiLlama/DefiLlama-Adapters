const { gmxExportsV2 } = require("../helper/gmx");

module.exports = {
  era: {
    tvl: gmxExportsV2({ eventEmitter: '0x9f006f3a4177e645fc872b911cf544e890c82b1a', fromBlock: 46545081 }),
  },
};
