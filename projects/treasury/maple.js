const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const MapleTreasury = "0xa9466EaBd096449d650D5AEB0dD3dA6F52FD0B19";
const USDC = ADDRESSES.ethereum.USDC;

module.exports = {
  ethereum: {
    tvl: staking(MapleTreasury, [USDC]),
  },
}
