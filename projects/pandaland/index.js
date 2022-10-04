const { masterChefExports, } = require("../helper/masterchef")

const PDA = "0x288B6Ca2eFCF39C9B68052B0088A0cB3f3D3B5f2";
const MASTERCHEF = "0x1682051ad5bb1933d5446fa6d4d9ad878df95f21";
const CHAIN = "smartbch";

const chefAbi = {
  "inputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "poolInfo",
  "outputs": [
    {
      "internalType": "contract IERC20",
      "name": "lpToken",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "allocPoint",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "lastRewardBlock",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "accSushiPerShare",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

module.exports = masterChefExports(MASTERCHEF, CHAIN, PDA, false, chefAbi)