const {masterChefExports} = require('../helper/masterchef')
const abi = {
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accMatrixPerShare, uint16 depositFeeBP, uint256 harvestInterval)"
  };const MATRIX = "0x35c167b6a1Fc4D1D2b55293367ef5b8D4aF0a696"
module.exports={
    misrepresentedTokens: true,
    methodology: "Tokens in masterchef",
    ...masterChefExports("0xacAb1D5FaBD5c675db07d40De8E0E218EBe75A9e", "cronos", MATRIX, false, abi.poolInfo),
}
