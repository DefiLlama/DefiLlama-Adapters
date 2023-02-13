const { staking } = require("../helper/staking");

const MapleTreasury = "0xa9466EaBd096449d650D5AEB0dD3dA6F52FD0B19";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

module.exports = {
  ethereum: {
    tvl: staking(MapleTreasury, [USDC]),
  },
}
