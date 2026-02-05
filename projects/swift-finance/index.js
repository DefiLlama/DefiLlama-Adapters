const abi = {
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accSwiftPerShare, uint16 depositFeeBP)"
  };
const {masterChefExports} = require("../helper/masterchef")

const token = "0x0Aa4ef05B43700BF4b6E6Dc83eA4e9C2CF6Af0fA";
const masterchef = "0x242c27C5F92e20d70CA0dAA7b76d927DFC7EF20B"

module.exports = masterChefExports(masterchef, "avax", token, true, abi.poolInfo)