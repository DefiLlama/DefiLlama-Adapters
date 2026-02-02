const abi = {
    "masterFarmerPoolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accBSCXPerShare)",
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accLqdrPerShare, uint16 depositFeeBP)",
    "poolLength": "uint256:poolLength",
    "balanceOf": "uint256:balanceOf",
    "lpToken": "function lpToken(uint256) view returns (address)",
    "strategies": "function strategies(uint256) view returns (address)"
  };

const MASTERCHEF = "0x4de6c2de6b9eBD974738686C9be7a31597146Ac6";
const MASTERCHEF2 = "0x92eEd89eeC81d992FF9135Ee451008E93b83dD86";
const MASTERCHEF3 = "0xC8FF977ee4e5EdA2D650C0e2706995a1DbB4926b";
const MASTERCHEF4 = "0xaDb6C60f0D62d6e7583e4b7B3697aAAd723d4a85";

const { uniTvlExport, masterchefExports } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");

const mcExports = [MASTERCHEF, MASTERCHEF2, MASTERCHEF3, MASTERCHEF4].map(masterchef => masterchefExports({
  chain: 'fantom',
  masterchef,
  poolInfoABI: masterchef === MASTERCHEF4 ? abi.masterFarmerPoolInfo : abi.poolInfo,
}))

module.exports = mergeExports([uniTvlExport('bsc', '0x40dFC2f530469452D5A9bB33356B071Be0758c4c'), ...mcExports])