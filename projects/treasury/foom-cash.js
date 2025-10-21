const { treasuryExports } = require("../helper/treasury");

const treasuries = {
  ethereum: '0x239AF915abcD0a5DCB8566e863088423831951f8',
  base: '0xdb203504ba1fea79164AF3CeFFBA88C59Ee8aAfD',
};

const tokens = {
  ethereum: {
    FOOM: '0xd0d56273290d339aaf1417d9bfa1bb8cfe8a0933',
  },
  base: {
    FOOM: '0x02300ac24838570012027e0a90d3feccef3c51d2',
  },
};

module.exports = treasuryExports({
  ethereum: {
    owners: [treasuries.ethereum],
    ownTokens: [tokens.ethereum.FOOM],
  },
  base: {
    owners: [treasuries.base],
    ownTokens: [tokens.base.FOOM],
  },
});
