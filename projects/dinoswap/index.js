const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accDinoPerShare)",
    "poolLength": "uint256:poolLength"
  };
const {masterChefExports} = require('../helper/masterchef');

const MASTERCHEF_CONTRACT = "0x1948abC5400Aa1d72223882958Da3bec643fb4E5";
const token = ADDRESSES.polygon.DINO;

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(MASTERCHEF_CONTRACT, "polygon", token, true, abi.poolInfo)
}