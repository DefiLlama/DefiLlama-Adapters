const { masterChefExports, } = require("../helper/masterchef")

const PDA = "0x288B6Ca2eFCF39C9B68052B0088A0cB3f3D3B5f2";
const MASTERCHEF = "0x1682051ad5bb1933d5446fa6d4d9ad878df95f21";
const CHAIN = "smartbch";

const chefAbi = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accSushiPerShare)'

module.exports = masterChefExports(MASTERCHEF, CHAIN, PDA, false, chefAbi)