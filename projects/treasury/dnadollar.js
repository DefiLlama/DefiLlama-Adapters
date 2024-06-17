const { staking } = require("../helper/staking");

const treasuryContract = "0x1420287565FD5Ebec8FbD720c17Cd911600449d3";

const DNA = "0xcc57f84637b441127f2f74905b9d99821b47b20c";


module.exports = {
  cronos: {
    tvl: () => ({}),
    ownTokens: staking(treasuryContract, DNA),
  },
};
